import { HealthStatus, SensorReading, ThresholdConfig } from '../types';

/**
 * Standard agronomic threshold configuration for greenhouse beds.
 * Maintained in a centralized location to avoid hardcoded values across the UI.
 */
export const THRESHOLDS: ThresholdConfig = {
  soilMoisture: {
    healthy: { min: 40, max: 80 },
    warningLow: { min: 30, max: 39 },
    warningHigh: { min: 81, max: 90 },
    criticalLowMax: 29.9,
    criticalHighMin: 90.1,
  },
  temperature: {
    healthy: { min: 20, max: 32 },
    warningLow: { min: 16, max: 19.9 },
    warningHigh: { min: 32.1, max: 36 },
    criticalLowMax: 15.9,
    criticalHighMin: 36.1,
  },
  humidity: {
    healthy: { min: 40, max: 80 },
    warningLow: { min: 30, max: 39 },
    warningHigh: { min: 81, max: 90 },
    criticalLowMax: 29.9,
    criticalHighMin: 90.1,
  },
};

/**
 * Standard Bed Definitions for the Urban Agricultural Community.
 */
export const GREENHOUSE_BEDS = [
  { id: 'BED-01', name: 'Bed 01 (Heirloom Tomatoes)', section: 'Greenhouse Alpha', crop: 'Heirloom Tomatoes' },
  { id: 'BED-02', name: 'Bed 02 (Sweet Bell Peppers)', section: 'Greenhouse Alpha', crop: 'Sweet Bell Peppers' },
  { id: 'BED-03', name: 'Bed 03 (Genovese Basil)', section: 'Greenhouse Alpha', crop: 'Genovese Basil' },
  { id: 'BED-04', name: 'Bed 04 (Butterhead Lettuce)', section: 'Greenhouse Beta', crop: 'Butterhead Lettuce' },
  { id: 'BED-05', name: 'Bed 05 (English Cucumbers)', section: 'Greenhouse Beta', crop: 'English Cucumbers' },
  { id: 'BED-06', name: 'Bed 06 (Microgreens Blend)', section: 'Greenhouse Beta', crop: 'Microgreens' },
  { id: 'BED-07', name: 'Bed 07 (Alpine Strawberries)', section: 'Greenhouse Gamma', crop: 'Alpine Strawberries' },
  { id: 'BED-08', name: 'Bed 08 (Culinary Mint)', section: 'Greenhouse Gamma', crop: 'Culinary Mint' },
] as const;

export type ValidBedId = typeof GREENHOUSE_BEDS[number]['id'];

export const BED_IDS: ValidBedId[] = GREENHOUSE_BEDS.map(b => b.id);

/**
 * Determine the health status of a specific sensor metric.
 */
export function evaluateMetricStatus(
  metric: 'soilMoisture' | 'temperature' | 'humidity',
  value: number
): HealthStatus {
  const cfg = THRESHOLDS[metric];

  // Healthy condition
  if (value >= cfg.healthy.min && value <= cfg.healthy.max) {
    return 'Healthy';
  }

  // Warning conditions
  if (
    (value >= cfg.warningLow.min && value <= cfg.warningLow.max) ||
    (value >= cfg.warningHigh.min && value <= cfg.warningHigh.max)
  ) {
    return 'Warning';
  }

  // Critical conditions
  if (value <= cfg.criticalLowMax || value >= cfg.criticalHighMin) {
    return 'Critical';
  }

  return 'Warning';
}

/**
 * Determine overall health status for a greenhouse bed reading.
 * Hierarchy: Critical > Warning > Healthy. If reading is older than 24 hours, Offline.
 */
export function calculateReadingHealthStatus(
  reading?: SensorReading,
  maxOfflineMinutes = 120
): HealthStatus {
  if (!reading) {
    return 'Offline';
  }

  const readingTime = new Date(reading.timestamp).getTime();
  const now = Date.now();
  const minutesSinceReading = (now - readingTime) / (1000 * 60);

  if (minutesSinceReading > maxOfflineMinutes) {
    return 'Offline';
  }

  const soilStatus = evaluateMetricStatus('soilMoisture', reading.soilMoisture);
  const tempStatus = evaluateMetricStatus('temperature', reading.temperature);
  const humStatus = evaluateMetricStatus('humidity', reading.humidity);

  if (soilStatus === 'Critical' || tempStatus === 'Critical' || humStatus === 'Critical') {
    return 'Critical';
  }

  if (soilStatus === 'Warning' || tempStatus === 'Warning' || humStatus === 'Warning') {
    return 'Warning';
  }

  return 'Healthy';
}
