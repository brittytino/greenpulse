import React, { useMemo } from 'react';
import { SensorReading, BedSummary } from '../types';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import { X, Droplet, Thermometer, CloudRain, Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils';
import { evaluateMetricStatus } from '../config/thresholds';

interface BedDetailModalProps {
  bed: BedSummary;
  readings: SensorReading[];
  onClose: () => void;
  onAddReading: (bedId: string) => void;
  onEditReading: (reading: SensorReading) => void;
  onDeleteReading: (reading: SensorReading) => void;
}

export const BedDetailModal: React.FC<BedDetailModalProps> = ({
  bed,
  readings,
  onClose,
  onAddReading,
  onEditReading,
  onDeleteReading,
}) => {
  // Filter readings specifically for this bed, sorted newest first
  const bedReadings = useMemo(() => {
    return readings
      .filter((r) => r.bedId === bed.bedId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [readings, bed.bedId]);

  const latest = bedReadings[0];

  // Aggregated stats (Avg, Min, Max)
  const stats = useMemo(() => {
    if (bedReadings.length === 0) return null;

    const moistures = bedReadings.map((r) => r.soilMoisture);
    const temps = bedReadings.map((r) => r.temperature);
    const humidities = bedReadings.map((r) => r.humidity);

    const sum = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0);

    return {
      moisture: {
        avg: (sum(moistures) / moistures.length).toFixed(1),
        min: Math.min(...moistures).toFixed(1),
        max: Math.max(...moistures).toFixed(1),
      },
      temp: {
        avg: (sum(temps) / temps.length).toFixed(1),
        min: Math.min(...temps).toFixed(1),
        max: Math.max(...temps).toFixed(1),
      },
      humidity: {
        avg: (sum(humidities) / humidities.length).toFixed(1),
        min: Math.min(...humidities).toFixed(1),
        max: Math.max(...humidities).toFixed(1),
      },
    };
  }, [bedReadings]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bed-detail-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xl font-bold text-slate-900">{bed.bedId}</span>
              <Badge variant={bed.status} showDot>
                {bed.status}
              </Badge>
            </div>
            <p id="bed-detail-title" className="text-xs text-slate-600 mt-0.5">
              {bed.bedName} • <span className="text-slate-500">{bed.greenhouseSection}</span>
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

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Current Live Readings Card */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Sensor Metrics
              </h4>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {latest ? `Updated ${formatRelativeTime(latest.timestamp)}` : 'No reading recorded'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Soil Moisture */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-blue-50/30">
                <div className="flex items-center justify-between text-slate-600 text-xs">
                  <span className="font-medium">Soil Moisture</span>
                  <Droplet className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {latest ? `${latest.soilMoisture}%` : '--'}
                </div>
                <div className="text-[11px] font-semibold mt-1">
                  {latest && (
                    <span
                      className={
                        evaluateMetricStatus('soilMoisture', latest.soilMoisture) === 'Healthy'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }
                    >
                      {evaluateMetricStatus('soilMoisture', latest.soilMoisture)} (Target 40-80%)
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-amber-50/30">
                <div className="flex items-center justify-between text-slate-600 text-xs">
                  <span className="font-medium">Temperature</span>
                  <Thermometer className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {latest ? `${latest.temperature}°C` : '--'}
                </div>
                <div className="text-[11px] font-semibold mt-1">
                  {latest && (
                    <span
                      className={
                        evaluateMetricStatus('temperature', latest.temperature) === 'Healthy'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }
                    >
                      {evaluateMetricStatus('temperature', latest.temperature)} (Target 20-32°C)
                    </span>
                  )}
                </div>
              </div>

              {/* Humidity */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-teal-50/30">
                <div className="flex items-center justify-between text-slate-600 text-xs">
                  <span className="font-medium">Humidity</span>
                  <CloudRain className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {latest ? `${latest.humidity}%` : '--'}
                </div>
                <div className="text-[11px] font-semibold mt-1">
                  {latest && (
                    <span
                      className={
                        evaluateMetricStatus('humidity', latest.humidity) === 'Healthy'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }
                    >
                      {evaluateMetricStatus('humidity', latest.humidity)} (Target 40-80%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Aggregations (Min, Avg, Max) */}
          {stats && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Statistical Summary ({bedReadings.length} readings)
              </h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Metric</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Minimum</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Average</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Maximum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-800">Soil Moisture (%)</td>
                      <td className="py-2.5 px-4 text-center font-mono">{stats.moisture.min}%</td>
                      <td className="py-2.5 px-4 text-center font-mono font-semibold text-blue-700">
                        {stats.moisture.avg}%
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">{stats.moisture.max}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-800">Temperature (°C)</td>
                      <td className="py-2.5 px-4 text-center font-mono">{stats.temp.min}°C</td>
                      <td className="py-2.5 px-4 text-center font-mono font-semibold text-amber-700">
                        {stats.temp.avg}°C
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">{stats.temp.max}°C</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-800">Humidity (%)</td>
                      <td className="py-2.5 px-4 text-center font-mono">{stats.humidity.min}%</td>
                      <td className="py-2.5 px-4 text-center font-mono font-semibold text-teal-700">
                        {stats.humidity.avg}%
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">{stats.humidity.max}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Historical Readings For This Bed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Readings Log
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddReading(bed.bedId)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Log Reading
              </Button>
            </div>

            {bedReadings.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center border rounded-lg">
                No historical sensor readings found for {bed.bedId}.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {bedReadings.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {formatDateTime(r.timestamp)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-slate-600">
                        <span>M: {r.soilMoisture}%</span>
                        <span>•</span>
                        <span>T: {r.temperature}°C</span>
                        <span>•</span>
                        <span>H: {r.humidity}%</span>
                        <span>•</span>
                        <Badge variant={r.source} className="text-[10px] py-0 px-1.5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditReading(r)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
                        title="Edit reading"
                        aria-label="Edit reading"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteReading(r)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                        title="Delete reading"
                        aria-label="Delete reading"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
