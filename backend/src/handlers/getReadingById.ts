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

    console.info(`[Handler: getReadingById] Fetching reading id=${id}`);
    const reading = await dynamodbService.getReadingById(id);

    if (!reading) {
      return buildErrorResponse(`Sensor reading with ID "${id}" was not found.`, 404);
    }

    return buildSuccessResponse(reading, 200);
  } catch (error) {
    console.error('[Handler: getReadingById] Unexpected error:', error);
    return buildErrorResponse('Unable to retrieve sensor reading', 500);
  }
}
