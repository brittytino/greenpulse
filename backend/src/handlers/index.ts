import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler as getReadingsHandler } from './getReadings.js';
import { handler as getReadingByIdHandler } from './getReadingById.js';
import { handler as createReadingHandler } from './createReading.js';
import { handler as updateReadingHandler } from './updateReading.js';
import { handler as deleteReadingHandler } from './deleteReading.js';
import { buildErrorResponse, buildSuccessResponse, handleOptions } from '../utils/response.js';

// Re-export individual handlers for backwards compatibility, modularity, and testing
export {
  getReadingsHandler,
  getReadingByIdHandler,
  createReadingHandler,
  updateReadingHandler,
  deleteReadingHandler,
};

/**
 * Unified AWS Lambda Handler for Single-Lambda Architecture: "GreenPulseAPI"
 *
 * Acts as the centralized API Gateway dispatcher routing requests based on:
 * - HTTP method (GET, POST, PUT, DELETE, OPTIONS)
 * - Path (/readings, /readings/{id}, /health)
 * - Path parameters ({ id })
 * - Query string parameters ({ bedId })
 *
 * Handler identifier in AWS Lambda: dist/handlers/index.handler
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = (
    event.httpMethod ||
    (event.requestContext as unknown as { http?: { method?: string } })?.http?.method ||
    'GET'
  ).toUpperCase();

  // Handle CORS preflight options request
  if (method === 'OPTIONS') {
    return handleOptions();
  }

  // Normalize path by stripping query strings and trailing slashes
  const rawPath = event.path || (event as unknown as { rawPath?: string }).rawPath || '';
  const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '');

  // Extract ID from pathParameters or parse from path (supports {proxy+} or /readings/{id})
  let id = event.pathParameters?.id;
  if (!id) {
    const match = cleanPath.match(/\/readings\/([^/?#]+)/);
    if (match && match[1]) {
      id = match[1];
    }
  }

  // Inject extracted id back into event.pathParameters so sub-handlers receive it reliably
  if (id) {
    event.pathParameters = {
      ...event.pathParameters,
      id,
    };
  }

  // Diagnostic / Health check endpoint
  if (cleanPath.endsWith('/health') || cleanPath === '/health') {
    return buildSuccessResponse({
      status: 'ok',
      service: 'GreenPulse Single-Lambda API (GreenPulseAPI)',
      timestamp: new Date().toISOString(),
    });
  }

  // Check if this is a collection-level route (/readings) or item-level route (/readings/{id})
  const isReadingsRoot =
    cleanPath.endsWith('/readings') || cleanPath === '' || cleanPath === '/';

  if (isReadingsRoot && !id) {
    switch (method) {
      case 'GET':
        return getReadingsHandler(event);
      case 'POST':
        return createReadingHandler(event);
      default:
        return buildErrorResponse(`Method ${method} not allowed on /readings`, 405);
    }
  }

  if (id || cleanPath.includes('/readings/')) {
    switch (method) {
      case 'GET':
        return getReadingByIdHandler(event);
      case 'PUT':
      case 'PATCH':
        return updateReadingHandler(event);
      case 'DELETE':
        return deleteReadingHandler(event);
      default:
        return buildErrorResponse(`Method ${method} not allowed on /readings/{id}`, 405);
    }
  }

  // Route not found fallback
  return buildErrorResponse(`Resource not found for ${method} ${rawPath}`, 404);
}

export default handler;
