import { describe, it, expect } from 'vitest';
import { evaluateMetricStatus, calculateReadingHealthStatus } from '../frontend/src/config/thresholds';
import { SensorReading } from '../shared/types/reading';

describe('Greenhouse Status and Threshold Calculations', () => {
  describe('Soil Moisture Evaluation', () => {
    it('evaluates healthy moisture (40% - 80%)', () => {
      expect(evaluateMetricStatus('soilMoisture', 40)).toBe('Healthy');
      expect(evaluateMetricStatus('soilMoisture', 60)).toBe('Healthy');
      expect(evaluateMetricStatus('soilMoisture', 80)).toBe('Healthy');
    });

    it('evaluates warning moisture (30-39% and 81-90%)', () => {
      expect(evaluateMetricStatus('soilMoisture', 35)).toBe('Warning');
      expect(evaluateMetricStatus('soilMoisture', 85)).toBe('Warning');
    });

    it('evaluates critical moisture (<30% and >90%)', () => {
      expect(evaluateMetricStatus('soilMoisture', 25)).toBe('Critical');
      expect(evaluateMetricStatus('soilMoisture', 95)).toBe('Critical');
    });
  });

  describe('Temperature Evaluation', () => {
    it('evaluates healthy temperature (20°C - 32°C)', () => {
      expect(evaluateMetricStatus('temperature', 20)).toBe('Healthy');
      expect(evaluateMetricStatus('temperature', 26)).toBe('Healthy');
      expect(evaluateMetricStatus('temperature', 32)).toBe('Healthy');
    });

    it('evaluates warning temperature (16-19.9°C and 32.1-36°C)', () => {
      expect(evaluateMetricStatus('temperature', 18)).toBe('Warning');
      expect(evaluateMetricStatus('temperature', 34)).toBe('Warning');
    });

    it('evaluates critical temperature (<16°C and >36°C)', () => {
      expect(evaluateMetricStatus('temperature', 14)).toBe('Critical');
      expect(evaluateMetricStatus('temperature', 38)).toBe('Critical');
    });
  });

  describe('Humidity Evaluation', () => {
    it('evaluates healthy humidity (40% - 80%)', () => {
      expect(evaluateMetricStatus('humidity', 50)).toBe('Healthy');
    });

    it('evaluates warning humidity (30-39% and 81-90%)', () => {
      expect(evaluateMetricStatus('humidity', 35)).toBe('Warning');
      expect(evaluateMetricStatus('humidity', 85)).toBe('Warning');
    });

    it('evaluates critical humidity (<30% and >90%)', () => {
      expect(evaluateMetricStatus('humidity', 20)).toBe('Critical');
      expect(evaluateMetricStatus('humidity', 95)).toBe('Critical');
    });
  });

  describe('Overall Reading Status Hierarchy', () => {
    const baseReading: SensorReading = {
      id: 'test-1',
      bedId: 'BED-01',
      timestamp: new Date().toISOString(),
      soilMoisture: 60,
      temperature: 24,
      humidity: 65,
      source: 'sensor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('returns Healthy when all metrics are in optimal range', () => {
      expect(calculateReadingHealthStatus(baseReading)).toBe('Healthy');
    });

    it('returns Warning if any metric is in Warning range', () => {
      const warnReading = { ...baseReading, soilMoisture: 35 };
      expect(calculateReadingHealthStatus(warnReading)).toBe('Warning');
    });

    it('returns Critical if any metric is in Critical range even if others are healthy', () => {
      const critReading = { ...baseReading, temperature: 40 }; // Critical heat
      expect(calculateReadingHealthStatus(critReading)).toBe('Critical');
    });

    it('returns Offline when no reading exists or timestamp is older than threshold', () => {
      expect(calculateReadingHealthStatus(undefined)).toBe('Offline');

      const oldReading: SensorReading = {
        ...baseReading,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      };
      expect(calculateReadingHealthStatus(oldReading, 120)).toBe('Offline');
    });
  });
});
