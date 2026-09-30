import React, { useState } from 'react';
import { CreateReadingDTO } from '../types';
import { Button } from './UI/Button';
import { Input } from './UI/Input';
import { Select } from './UI/Select';
import { X, Droplet, Thermometer, CloudRain, Calendar } from 'lucide-react';
import { GREENHOUSE_BEDS } from '../config/thresholds';
import { validateCreateReading } from '../utils/validation';
import { toDatetimeLocalInput, fromDatetimeLocalInput } from '../utils/dateUtils';

interface AddReadingModalProps {
  isOpen: boolean;
  initialBedId?: string;
  onClose: () => void;
  onSubmit: (data: CreateReadingDTO) => Promise<void>;
}

export const AddReadingModal: React.FC<AddReadingModalProps> = ({
  isOpen,
  initialBedId,
  onClose,
  onSubmit,
}) => {
  const [bedId, setBedId] = useState<string>(initialBedId || 'BED-01');
  const [soilMoisture, setSoilMoisture] = useState<string>('55.0');
  const [temperature, setTemperature] = useState<string>('24.5');
  const [humidity, setHumidity] = useState<string>('65.0');
  const [timestamp, setTimestamp] = useState<string>(toDatetimeLocalInput());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateReadingDTO = {
      bedId,
      soilMoisture: parseFloat(soilMoisture),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      timestamp: fromDatetimeLocalInput(timestamp),
      source: 'manual',
    };

    const validation = validateCreateReading(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save sensor reading.';
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bedOptions = GREENHOUSE_BEDS.map((bed) => ({
    value: bed.id,
    label: `${bed.id} - ${bed.crop} (${bed.section})`,
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-reading-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 id="add-reading-title" className="text-base font-bold text-slate-900">
              Add Manual Sensor Reading
            </h3>
            <p className="text-xs text-slate-500">
              Record verified manual or calibration reading for greenhouse telemetry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {errors.form}
            </div>
          )}

          {/* Bed Dropdown */}
          <Select
            label="Greenhouse Bed"
            options={bedOptions}
            value={bedId}
            onChange={(e) => setBedId(e.target.value)}
            error={errors.bedId}
            required
            helperText="Select the greenhouse bed to record measurements for."
          />

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Soil Moisture */}
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              label="Soil Moisture"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(e.target.value)}
              error={errors.soilMoisture}
              required
              suffix="%"
              prefixIcon={<Droplet className="w-4 h-4 text-blue-500" />}
              helperText="Optimal target: 40% - 80%"
            />

            {/* Temperature */}
            <Input
              type="number"
              step="0.1"
              label="Temperature"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              error={errors.temperature}
              required
              suffix="°C"
              prefixIcon={<Thermometer className="w-4 h-4 text-amber-500" />}
              helperText="Optimal target: 20°C - 32°C"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Humidity */}
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              label="Air Humidity"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              error={errors.humidity}
              required
              suffix="%"
              prefixIcon={<CloudRain className="w-4 h-4 text-teal-500" />}
              helperText="Optimal target: 40% - 80%"
            />

            {/* Timestamp */}
            <Input
              type="datetime-local"
              label="Recorded Date & Time"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              error={errors.timestamp}
              required
              prefixIcon={<Calendar className="w-4 h-4 text-slate-400" />}
              helperText="Defaults to current timestamp"
            />
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium text-slate-700">Source:</span>
            <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Manual Reading
            </span>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              Save Reading
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
