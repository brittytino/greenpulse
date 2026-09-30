import { ApiResponse } from '../types';

/**
 * Verified production AWS API Gateway endpoint.
 * This is the production source of truth for the GreenPulse dashboard.
 */
export const DEFAULT_AWS_API_BASE_URL = 'https://qddi25eqeb.execute-api.eu-north-1.amazonaws.com';

/**
 * Resolves the API Base URL from environment variables with safe production fallbacks.
 * Supported variables (in precedence order):
 * 1. VITE_API_BASE_URL (standard for this Vite project)
 * 2. VITE_API_URL
 * 3. NEXT_PUBLIC_API_URL (supported for Vercel configurations)
 * 4. NEXT_PUBLIC_API_BASE_URL
 *
 * In production mode (import.meta.env.PROD), it will NEVER resolve to localhost.
 */
export function getApiBaseUrl(): string {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    import.meta.env.NEXT_PUBLIC_API_BASE_URL;

  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // In production builds (Vercel, Amplify, etc.), ALWAYS default to the real AWS API Gateway URL.
  // The production frontend MUST NEVER call localhost.
  if (import.meta.env.PROD) {
    return DEFAULT_AWS_API_BASE_URL;
  }

  // Local development fallback when no environment variable is provided
  return 'http://localhost:3000';
}

export const API_BASE_URL = getApiBaseUrl();

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
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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

    const rawMessage = error instanceof Error ? error.message : 'Network connection error';
    
    // Provide diagnostic information if network/CORS error occurs
    let friendlyMessage = rawMessage;
    if (rawMessage === 'Failed to fetch' || rawMessage === 'NetworkError when attempting to fetch resource.') {
      friendlyMessage = `Unable to connect to API at ${baseUrl}. Please check network connectivity or verify API Gateway CORS configuration.`;
    }

    throw new ApiError(friendlyMessage, 0);
  }
}
