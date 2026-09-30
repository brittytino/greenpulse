import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodbService } from '../services/dynamodbService.js';
import { validateUpdateReading } from '../utils/validation.js';
import { buildSuccessResponse, buildErrorResponse, handleOptions } from '../utils/response.js';
import { UpdateReadingDTO } from '../types/index.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return buildErrorResponse('Reading ID parameter is required.', 400);
    }

    if (!event.body) {
      return buildErrorResponse('Request body is missing.', 400);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(event.body);
    } catch {
      return buildErrorResponse('Malformed JSON in request body.', 400);
    }

    const validation = validateUpdateReading(payload);
    if (!validation.isValid) {
      console.warn(`[Handler: updateReading] Validation failed for id=${id}:`, validation.errors);
      return buildErrorResponse('Validation error', 400, validation.errors);
    }

    const data = payload as UpdateReadingDTO;
    console.info(`[Handler: updateReading] Updating reading id=${id}`);

    const updated = await dynamodbService.updateReading(id, data);
    if (!updated) {
      return buildErrorResponse(`Sensor reading with ID "${id}" was not found.`, 404);
    }

    return buildSuccessResponse(updated, 200, 'Sensor reading updated successfully');
  } catch (error) {
    console.error('[Handler: updateReading] Unexpected error:', error);
    return buildErrorResponse('Unable to update sensor reading', 500);
  }
}
