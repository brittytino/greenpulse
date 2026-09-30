export type SensorReadingSource = 'manual' | 'sensor' | 'simulated';

export type HealthStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';

export interface SensorReading {
  id: string;
  bedId: string;
  timestamp: string; // ISO 8601
  soilMoisture: number; // 0 - 100 percentage
  temperature: number; // Celsius
  humidity: number; // 0 - 100 percentage
  source: SensorReadingSource;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface CreateReadingDTO {
  bedId: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  timestamp?: string;
  source?: SensorReadingSource;
}

export interface UpdateReadingDTO {
  bedId?: string;
  soilMoisture?: number;
  temperature?: number;
  humidity?: number;
  timestamp?: string;
  source?: SensorReadingSource;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface QueryParams {
  bedId?: string;
  limit?: number;
}
