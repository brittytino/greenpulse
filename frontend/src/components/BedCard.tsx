import React from 'react';
import { BedSummary } from '../types';
import { Card } from './UI/Card';
import { Badge } from './UI/Badge';
import { Droplet, Thermometer, CloudRain, Clock, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '../utils/dateUtils';
import { evaluateMetricStatus } from '../config/thresholds';

interface BedCardProps {
  bed: BedSummary;
  onSelectBed: (bedId: string) => void;
  onAddReadingForBed: (bedId: string) => void;
}

export const BedCard: React.FC<BedCardProps> = ({
  bed,
  onSelectBed,
  onAddReadingForBed,
}) => {
  const reading = bed.latestReading;

  // Determine individual metric statuses
  const soilStatus = reading ? evaluateMetricStatus('soilMoisture', reading.soilMoisture) : 'Offline';
  const tempStatus = reading ? evaluateMetricStatus('temperature', reading.temperature) : 'Offline';
  const humStatus = reading ? evaluateMetricStatus('humidity', reading.humidity) : 'Offline';

  return (
    <Card className="hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-slate-900 group-hover:text-agri-700 transition-colors">
                {bed.bedId}
              </span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-[130px]">
                {bed.greenhouseSection}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium line-clamp-1">
              {bed.bedName.replace(/^[^(]+\(([^)]+)\)$/, '$1')}
            </p>
          </div>

          <Badge variant={bed.status} showDot>
            {bed.status}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {/* Soil Moisture */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Moisture</span>
              <Droplet className="w-3 h-3 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-800">
                {reading ? `${reading.soilMoisture}%` : '--'}
              </span>
            </div>
            <div className="mt-1 text-[10px]">
              <span
                className={`font-semibold ${
                  soilStatus === 'Healthy'
                    ? 'text-emerald-700'
                    : soilStatus === 'Warning'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {reading ? soilStatus : 'No data'}
              </span>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Temp</span>
              <Thermometer className="w-3 h-3 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-800">
                {reading ? `${reading.temperature}°C` : '--'}
              </span>
            </div>
            <div className="mt-1 text-[10px]">
              <span
                className={`font-semibold ${
                  tempStatus === 'Healthy'
                    ? 'text-emerald-700'
                    : tempStatus === 'Warning'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {reading ? tempStatus : 'No data'}
              </span>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Humidity</span>
              <CloudRain className="w-3 h-3 text-teal-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-800">
                {reading ? `${reading.humidity}%` : '--'}
              </span>
            </div>
            <div className="mt-1 text-[10px]">
              <span
                className={`font-semibold ${
                  humStatus === 'Healthy'
                    ? 'text-emerald-700'
                    : humStatus === 'Warning'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {reading ? humStatus : 'No data'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info & Quick Link */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {reading ? `Updated ${formatRelativeTime(reading.timestamp)}` : 'No readings yet'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddReadingForBed(bed.bedId)}
            type="button"
            className="text-[11px] font-medium text-slate-600 hover:text-agri-700 hover:underline px-1 py-0.5"
            title={`Log reading for ${bed.bedId}`}
          >
            + Log
          </button>
          <button
            onClick={() => onSelectBed(bed.bedId)}
            type="button"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-agri-700 hover:text-agri-800 focus:outline-none focus:underline"
            aria-label={`View details for ${bed.bedId}`}
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
