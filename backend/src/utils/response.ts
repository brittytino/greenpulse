import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponse } from '../types/index.js';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export function buildSuccessResponse<T>(
  data: T,
  statusCode = 200,
  message?: string
): APIGatewayProxyResult {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function buildErrorResponse(
  message: string,
  statusCode = 500,
  errors?: Record<string, string>
): APIGatewayProxyResult {
  const body: ApiResponse = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function handleOptions(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  };
}
