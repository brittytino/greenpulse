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
}

export interface BedSummary {
  bedId: string;
  bedName: string;
  greenhouseSection: string;
  latestReading?: SensorReading;
  status: HealthStatus;
  readingCount: number;
}

export interface DashboardStatistics {
  totalBeds: number;
  activeBeds: number;
  averageSoilMoisture: number;
  averageTemperature: number;
  averageHumidity: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  offlineCount: number;
  lastUpdated: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface ThresholdRange {
  healthy: { min: number; max: number };
  warningLow?: { min: number; max: number };
  warningHigh?: { min: number; max: number };
  criticalLow?: number;
  criticalHigh?: number;
}

export interface MetricThresholds {
  soilMoisture: ThresholdRange;
  temperature: ThresholdRange;
  humidity: ThresholdRange;
}
