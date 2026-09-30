import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodbService } from '../services/dynamodbService.js';
import { buildSuccessResponse, buildErrorResponse, handleOptions } from '../utils/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const bedId = event.queryStringParameters?.bedId;
    console.info(`[Handler: getReadings] Fetching readings${bedId ? ` for bedId=${bedId}` : ''}`);

    const readings = await dynamodbService.getReadings(bedId);
    return buildSuccessResponse(readings, 200);
  } catch (error) {
    console.error('[Handler: getReadings] Unexpected error:', error);
    return buildErrorResponse('Unable to retrieve greenhouse readings', 500);
  }
}
