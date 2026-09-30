import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodbService } from '../services/dynamodbService.js';
import { validateCreateReading } from '../utils/validation.js';
import { buildSuccessResponse, buildErrorResponse, handleOptions } from '../utils/response.js';
import { CreateReadingDTO } from '../types/index.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    if (!event.body) {
      return buildErrorResponse('Request body is missing.', 400);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(event.body);
    } catch {
      return buildErrorResponse('Malformed JSON in request body.', 400);
    }

    // Input Validation
    const validation = validateCreateReading(payload);
    if (!validation.isValid) {
      console.warn('[Handler: createReading] Validation failed:', validation.errors);
      return buildErrorResponse('Validation error', 400, validation.errors);
    }

    const data = payload as CreateReadingDTO;
    console.info(`[Handler: createReading] Creating reading for bed=${data.bedId}`);

    const newReading = await dynamodbService.createReading(data);
    return buildSuccessResponse(newReading, 201, 'Sensor reading created successfully');
  } catch (error) {
    console.error('[Handler: createReading] Unexpected error:', error);
    return buildErrorResponse('Unable to record sensor reading', 500);
  }
}
