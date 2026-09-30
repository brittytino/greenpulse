import React, { useState, useEffect } from 'react';
import { SensorReading, UpdateReadingDTO } from '../types';
import { Button } from './UI/Button';
import { Input } from './UI/Input';
import { Select } from './UI/Select';
import { X, Droplet, Thermometer, CloudRain, Calendar } from 'lucide-react';
import { GREENHOUSE_BEDS } from '../config/thresholds';
import { validateReadingInput } from '../utils/validation';
import { toDatetimeLocalInput, fromDatetimeLocalInput, formatDateTime } from '../utils/dateUtils';

interface EditReadingModalProps {
  reading: SensorReading | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateReadingDTO) => Promise<void>;
}

export const EditReadingModal: React.FC<EditReadingModalProps> = ({
  reading,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [bedId, setBedId] = useState<string>('BED-01');
  const [soilMoisture, setSoilMoisture] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [humidity, setHumidity] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reading) {
      setBedId(reading.bedId);
      setSoilMoisture(reading.soilMoisture.toString());
      setTemperature(reading.temperature.toString());
      setHumidity(reading.humidity.toString());
      setTimestamp(toDatetimeLocalInput(reading.timestamp));
      setErrors({});
    }
  }, [reading]);

  if (!isOpen || !reading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: UpdateReadingDTO = {
      bedId,
      soilMoisture: parseFloat(soilMoisture),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      timestamp: fromDatetimeLocalInput(timestamp),
    };

    const validation = validateReadingInput(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(reading.id, payload);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update sensor reading.';
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
      aria-labelledby="edit-reading-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 id="edit-reading-title" className="text-base font-bold text-slate-900">
                Edit Sensor Reading
              </h3>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                ID: {reading.id}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Created {formatDateTime(reading.createdAt)} • Source: {reading.source}
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
              helperText="Optimal: 40% - 80%"
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
              helperText="Optimal: 20°C - 32°C"
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
              helperText="Optimal: 40% - 80%"
            />

            {/* Timestamp */}
            <Input
              type="datetime-local"
              label="Recorded Timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              error={errors.timestamp}
              required
              prefixIcon={<Calendar className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              Update Reading
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
