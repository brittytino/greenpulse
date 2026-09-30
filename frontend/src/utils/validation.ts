import { CreateReadingDTO, UpdateReadingDTO } from '../types';
import { BED_IDS } from '../config/thresholds';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateReadingInput(input: Partial<CreateReadingDTO | UpdateReadingDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  // Bed ID Validation
  if (input.bedId !== undefined) {
    if (!input.bedId || typeof input.bedId !== 'string') {
      errors.bedId = 'Greenhouse bed selection is required.';
    } else if (!BED_IDS.includes(input.bedId as typeof BED_IDS[number])) {
      errors.bedId = `Invalid bed identifier. Must be one of: ${BED_IDS.join(', ')}`;
    }
  }

  // Soil Moisture Validation (0 - 100)
  if (input.soilMoisture !== undefined) {
    if (input.soilMoisture === null || isNaN(Number(input.soilMoisture))) {
      errors.soilMoisture = 'Soil moisture must be a valid number.';
    } else {
      const val = Number(input.soilMoisture);
      if (val < 0 || val > 100) {
        errors.soilMoisture = 'Soil moisture must be between 0% and 100%.';
      }
    }
  }

  // Temperature Validation (-20 to 65 °C)
  if (input.temperature !== undefined) {
    if (input.temperature === null || isNaN(Number(input.temperature))) {
      errors.temperature = 'Temperature must be a valid number.';
    } else {
      const val = Number(input.temperature);
      if (val < -20 || val > 65) {
        errors.temperature = 'Temperature must be between -20°C and 65°C.';
      }
    }
  }

  // Humidity Validation (0 - 100)
  if (input.humidity !== undefined) {
    if (input.humidity === null || isNaN(Number(input.humidity))) {
      errors.humidity = 'Humidity must be a valid number.';
    } else {
      const val = Number(input.humidity);
      if (val < 0 || val > 100) {
        errors.humidity = 'Humidity must be between 0% and 100%.';
      }
    }
  }

  // Timestamp Validation
  if (input.timestamp !== undefined && input.timestamp !== '') {
    const time = new Date(input.timestamp).getTime();
    if (isNaN(time)) {
      errors.timestamp = 'Timestamp must be a valid date and time format.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCreateReading(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Input payload must be a non-null object.' }
    };
  }

  const payload = input as Partial<CreateReadingDTO>;
  const errors: Record<string, string> = {};

  if (!payload.bedId) {
    errors.bedId = 'Greenhouse bed selection is required.';
  }

  if (payload.soilMoisture === undefined || payload.soilMoisture === null) {
    errors.soilMoisture = 'Soil moisture reading is required.';
  }

  if (payload.temperature === undefined || payload.temperature === null) {
    errors.temperature = 'Temperature reading is required.';
  }

  if (payload.humidity === undefined || payload.humidity === null) {
    errors.humidity = 'Humidity reading is required.';
  }

  const fieldValidation = validateReadingInput(payload);
  const combinedErrors = { ...errors, ...fieldValidation.errors };

  return {
    isValid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors,
  };
}
