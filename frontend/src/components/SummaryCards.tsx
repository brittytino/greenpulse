import React from 'react';
import { DashboardStatistics } from '../types';
import { Droplet, Thermometer, CloudRain, Grid, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './UI/Card';

interface SummaryCardsProps {
  statistics: DashboardStatistics;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Beds Card */}
      <Card className="hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Beds
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {statistics.totalBeds}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Active beds ({statistics.activeBeds} online)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {statistics.healthyCount} Healthy
            </span>
            {statistics.warningCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                {statistics.warningCount} Warn
              </span>
            )}
            {statistics.criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                {statistics.criticalCount} Crit
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Average Soil Moisture */}
      <Card className="hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Soil Moisture
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {statistics.averageSoilMoisture}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              Across monitored beds
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Optimal target:</span>
            <span className="font-semibold text-slate-700">40% - 80%</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Temperature */}
      <Card className="hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Temperature
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {statistics.averageTemperature}°C
            </span>
            <span className="text-xs font-medium text-slate-500">
              Current average
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Optimal target:</span>
            <span className="font-semibold text-slate-700">20°C - 32°C</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Humidity */}
      <Card className="hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Humidity
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {statistics.averageHumidity}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              Current average
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Optimal target:</span>
            <span className="font-semibold text-slate-700">40% - 80%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
