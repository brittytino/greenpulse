import { describe, it, expect } from 'vitest';
import { validateCreateReading, validateReadingInput } from '../frontend/src/utils/validation';

describe('Sensor Reading Input Validation', () => {
  it('validates a correct reading payload successfully', () => {
    const valid = {
      bedId: 'BED-01',
      soilMoisture: 65.5,
      temperature: 24.2,
      humidity: 68.0,
      timestamp: new Date().toISOString(),
      source: 'manual' as const,
    };

    const res = validateCreateReading(valid);
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  it('rejects missing required fields', () => {
    const incomplete = {
      soilMoisture: 50,
    };

    const res = validateCreateReading(incomplete);
    expect(res.isValid).toBe(false);
    expect(res.errors.bedId).toBeDefined();
    expect(res.errors.temperature).toBeDefined();
    expect(res.errors.humidity).toBeDefined();
  });

  it('rejects invalid moisture values (< 0 or > 100)', () => {
    const lowMoisture = validateReadingInput({ soilMoisture: -5 });
    expect(lowMoisture.isValid).toBe(false);
    expect(lowMoisture.errors.soilMoisture).toContain('between 0% and 100%');

    const highMoisture = validateReadingInput({ soilMoisture: 105 });
    expect(highMoisture.isValid).toBe(false);
    expect(highMoisture.errors.soilMoisture).toContain('between 0% and 100%');
  });

  it('rejects invalid humidity values (< 0 or > 100)', () => {
    const lowHumidity = validateReadingInput({ humidity: -1 });
    expect(lowHumidity.isValid).toBe(false);
    expect(lowHumidity.errors.humidity).toContain('between 0% and 100%');

    const highHumidity = validateReadingInput({ humidity: 101 });
    expect(highHumidity.isValid).toBe(false);
    expect(highHumidity.errors.humidity).toContain('between 0% and 100%');
  });

  it('rejects invalid temperature values outside agronomic safety limits', () => {
    const extremeCold = validateReadingInput({ temperature: -30 });
    expect(extremeCold.isValid).toBe(false);
    expect(extremeCold.errors.temperature).toContain('between -20°C and 65°C');

    const extremeHeat = validateReadingInput({ temperature: 80 });
    expect(extremeHeat.isValid).toBe(false);
    expect(extremeHeat.errors.temperature).toContain('between -20°C and 65°C');
  });

  it('rejects invalid greenhouse bed IDs', () => {
    const invalidBed = validateReadingInput({ bedId: 'BED-99' });
    expect(invalidBed.isValid).toBe(false);
    expect(invalidBed.errors.bedId).toContain('Invalid bed identifier');
  });

  it('rejects invalid timestamp format', () => {
    const invalidTime = validateReadingInput({ timestamp: 'not-a-valid-date' });
    expect(invalidTime.isValid).toBe(false);
    expect(invalidTime.errors.timestamp).toBeDefined();
  });
});
