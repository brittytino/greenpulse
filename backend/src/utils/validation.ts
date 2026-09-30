import { CreateReadingDTO, UpdateReadingDTO } from '../types/index.js';

export const VALID_BED_IDS = [
  'BED-01',
  'BED-02',
  'BED-03',
  'BED-04',
  'BED-05',
  'BED-06',
  'BED-07',
  'BED-08',
] as const;

export interface ValidationOutput {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateCreateReading(payload: unknown): ValidationOutput {
  const errors: Record<string, string> = {};

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: { body: 'Request body must be a valid JSON object.' },
    };
  }

  const data = payload as Partial<CreateReadingDTO>;

  // Check required fields
  if (!data.bedId || typeof data.bedId !== 'string') {
    errors.bedId = 'Field "bedId" is required.';
  } else if (!VALID_BED_IDS.includes(data.bedId as typeof VALID_BED_IDS[number])) {
    errors.bedId = `Invalid bedId. Must be one of: ${VALID_BED_IDS.join(', ')}`;
  }

  // Soil Moisture (0 - 100)
  if (data.soilMoisture === undefined || data.soilMoisture === null) {
    errors.soilMoisture = 'Field "soilMoisture" is required.';
  } else {
    const val = Number(data.soilMoisture);
    if (isNaN(val)) {
      errors.soilMoisture = 'Field "soilMoisture" must be a numeric value.';
    } else if (val < 0 || val > 100) {
      errors.soilMoisture = 'Field "soilMoisture" must be between 0% and 100%.';
    }
  }

  // Temperature (-20 to 65 °C)
  if (data.temperature === undefined || data.temperature === null) {
    errors.temperature = 'Field "temperature" is required.';
  } else {
    const val = Number(data.temperature);
    if (isNaN(val)) {
      errors.temperature = 'Field "temperature" must be a numeric value.';
    } else if (val < -20 || val > 65) {
      errors.temperature = 'Field "temperature" must be between -20°C and 65°C.';
    }
  }

  // Humidity (0 - 100)
  if (data.humidity === undefined || data.humidity === null) {
    errors.humidity = 'Field "humidity" is required.';
  } else {
    const val = Number(data.humidity);
    if (isNaN(val)) {
      errors.humidity = 'Field "humidity" must be a numeric value.';
    } else if (val < 0 || val > 100) {
      errors.humidity = 'Field "humidity" must be between 0% and 100%.';
    }
  }

  // Timestamp
  if (data.timestamp !== undefined && data.timestamp !== null) {
    const time = new Date(data.timestamp).getTime();
    if (isNaN(time)) {
      errors.timestamp = 'Field "timestamp" must be a valid ISO 8601 date string.';
    }
  }

  // Source
  if (data.source !== undefined && data.source !== null) {
    if (!['manual', 'sensor', 'simulated'].includes(data.source)) {
      errors.source = 'Field "source" must be one of: manual, sensor, simulated.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUpdateReading(payload: unknown): ValidationOutput {
  const errors: Record<string, string> = {};

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: { body: 'Request body must be a valid JSON object.' },
    };
  }

  const data = payload as Partial<UpdateReadingDTO>;

  if (Object.keys(data).length === 0) {
    return {
      isValid: false,
      errors: { body: 'At least one field must be provided to perform an update.' },
    };
  }

  if (data.bedId !== undefined) {
    if (!data.bedId || typeof data.bedId !== 'string') {
      errors.bedId = 'Field "bedId" cannot be empty.';
    } else if (!VALID_BED_IDS.includes(data.bedId as typeof VALID_BED_IDS[number])) {
      errors.bedId = `Invalid bedId. Must be one of: ${VALID_BED_IDS.join(', ')}`;
    }
  }

  if (data.soilMoisture !== undefined) {
    const val = Number(data.soilMoisture);
    if (isNaN(val) || val < 0 || val > 100) {
      errors.soilMoisture = 'Field "soilMoisture" must be a number between 0% and 100%.';
    }
  }

  if (data.temperature !== undefined) {
    const val = Number(data.temperature);
    if (isNaN(val) || val < -20 || val > 65) {
      errors.temperature = 'Field "temperature" must be a number between -20°C and 65°C.';
    }
  }

  if (data.humidity !== undefined) {
    const val = Number(data.humidity);
    if (isNaN(val) || val < 0 || val > 100) {
      errors.humidity = 'Field "humidity" must be a number between 0% and 100%.';
    }
  }

  if (data.timestamp !== undefined) {
    const time = new Date(data.timestamp).getTime();
    if (isNaN(time)) {
      errors.timestamp = 'Field "timestamp" must be a valid ISO 8601 date string.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
