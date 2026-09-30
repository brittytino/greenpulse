import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodbService } from '../services/dynamodbService.js';
import { buildSuccessResponse, buildErrorResponse, handleOptions } from '../utils/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return buildErrorResponse('Reading ID parameter is required.', 400);
    }

    console.info(`[Handler: deleteReading] Deleting reading id=${id}`);
    const existing = await dynamodbService.getReadingById(id);
    if (!existing) {
      return buildErrorResponse(`Sensor reading with ID "${id}" was not found.`, 404);
    }

    const deleted = await dynamodbService.deleteReading(id);
    if (!deleted) {
      return buildErrorResponse('Failed to remove sensor reading.', 500);
    }

    return buildSuccessResponse({ id, deleted: true }, 200, 'Sensor reading removed successfully');
  } catch (error) {
    console.error('[Handler: deleteReading] Unexpected error:', error);
    return buildErrorResponse('Unable to remove sensor reading', 500);
  }
}
