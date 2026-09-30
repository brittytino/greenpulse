import { ApiResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export class ApiError extends Error {
  public statusCode?: number;
  public details?: Record<string, string>;

  constructor(message: string, statusCode?: number, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Universal HTTP client for communicating with AWS API Gateway or local backend.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: response.ok,
      message: response.statusText || 'Unable to parse server response',
    }));

    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed with status code ${response.status}`,
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Network connection error';
    throw new ApiError(message, 0);
  }
}
