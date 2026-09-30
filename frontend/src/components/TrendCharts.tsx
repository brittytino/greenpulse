import React, { useState, useMemo } from 'react';
import { SensorReading } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './UI/Card';
import { Droplet, Thermometer, CloudRain } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateUtils';
import { BED_IDS } from '../config/thresholds';

interface TrendChartsProps {
  readings: SensorReading[];
  selectedBedId?: string;
  onSelectBedId?: (bedId: string) => void;
}

interface SvgPoint {
  x: number;
  y: number;
  value: number;
  timestamp: string;
  bedId: string;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
  readings,
  selectedBedId = 'ALL',
  onSelectBedId,
}) => {
  const [activeMetric, setActiveMetric] = useState<'soilMoisture' | 'temperature' | 'humidity'>('soilMoisture');
  const [hoveredPoint, setHoveredPoint] = useState<SvgPoint | null>(null);

  // Filter and sort readings chronologically (oldest to newest for trend)
  const chartData = useMemo(() => {
    let filtered = readings;
    if (selectedBedId && selectedBedId !== 'ALL') {
      filtered = filtered.filter((r) => r.bedId === selectedBedId);
    }
    // Sort oldest to newest
    return [...filtered].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [readings, selectedBedId]);

  // Metric configs
  const metricConfigs = {
    soilMoisture: {
      title: 'Soil Moisture Trend',
      unit: '%',
      color: '#2563eb', // Blue
      strokeClass: 'stroke-blue-600',
      fillClass: 'fill-blue-500/10',
      healthyMin: 40,
      healthyMax: 80,
      icon: Droplet,
    },
    temperature: {
      title: 'Temperature Trend',
      unit: '°C',
      color: '#d97706', // Amber
      strokeClass: 'stroke-amber-600',
      fillClass: 'fill-amber-500/10',
      healthyMin: 20,
      healthyMax: 32,
      icon: Thermometer,
    },
    humidity: {
      title: 'Humidity Trend',
      unit: '%',
      color: '#0d9488', // Teal
      strokeClass: 'stroke-teal-600',
      fillClass: 'fill-teal-500/10',
      healthyMin: 40,
      healthyMax: 80,
      icon: CloudRain,
    },
  };

  const currentCfg = metricConfigs[activeMetric];

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Calculate points and scales
  const values = chartData.map((d) => d[activeMetric]);
  const minValue = values.length > 0 ? Math.floor(Math.min(...values, currentCfg.healthyMin - 5)) : 0;
  const maxValue = values.length > 0 ? Math.ceil(Math.max(...values, currentCfg.healthyMax + 5)) : 100;
  const range = maxValue - minValue || 1;

  const points: SvgPoint[] = useMemo(() => {
    if (chartData.length === 0) return [];
    if (chartData.length === 1) {
      return [
        {
          x: padding.left + innerWidth / 2,
          y: padding.top + innerHeight / 2,
          value: chartData[0][activeMetric],
          timestamp: chartData[0].timestamp,
          bedId: chartData[0].bedId,
        },
      ];
    }

    return chartData.map((d, index) => {
      const x = padding.left + (index / (chartData.length - 1)) * innerWidth;
      const normalizedY = (d[activeMetric] - minValue) / range;
      const y = padding.top + innerHeight - normalizedY * innerHeight;
      return {
        x,
        y,
        value: d[activeMetric],
        timestamp: d.timestamp,
        bedId: d.bedId,
      };
    });
  }, [chartData, activeMetric, minValue, range, innerWidth, innerHeight, padding.left, padding.top]);

  // Construct SVG path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y}`;
    }
    return points.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length <= 1) return '';
    const bottomY = padding.top + innerHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [linePath, points, padding.top, innerHeight]);

  // Optimal band Y coordinates
  const healthyTopY = padding.top + innerHeight - ((currentCfg.healthyMax - minValue) / range) * innerHeight;
  const healthyBottomY = padding.top + innerHeight - ((currentCfg.healthyMin - minValue) / range) * innerHeight;
  const healthyHeight = Math.max(0, healthyBottomY - healthyTopY);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Agronomic Trend Analysis
          </CardTitle>
          <p className="text-xs text-slate-500">
            Historical readings {selectedBedId === 'ALL' ? 'across all greenhouse beds' : `for ${selectedBedId}`}
          </p>
        </div>

        {/* Controls: Metric Switcher and Bed Filter */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Bed selector */}
          {onSelectBedId && (
            <select
              value={selectedBedId}
              onChange={(e) => onSelectBedId(e.target.value)}
              className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 pl-2.5 pr-7 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-agri-500"
              aria-label="Filter trends by greenhouse bed"
            >
              <option value="ALL">All Beds Combined</option>
              {BED_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          )}

          {/* Metric tabs */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setActiveMetric('soilMoisture')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                activeMetric === 'soilMoisture'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Droplet className="w-3 h-3 text-blue-500" />
              <span>Moisture</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('temperature')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                activeMetric === 'temperature'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Thermometer className="w-3 h-3 text-amber-500" />
              <span>Temp</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('humidity')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                activeMetric === 'humidity'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CloudRain className="w-3 h-3 text-teal-500" />
              <span>Humidity</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-center text-xs text-slate-500">
            No sensor readings available for trend visualization.
          </div>
        ) : (
          <div className="w-full">
            {/* Legend & Target Range Info */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mb-3 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: currentCfg.color }}
                  />
                  {currentCfg.title}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Healthy Zone: {currentCfg.healthyMin}
                  {currentCfg.unit} - {currentCfg.healthyMax}
                  {currentCfg.unit}
                </span>
              </div>

              {hoveredPoint && (
                <div className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                  {hoveredPoint.bedId}:{' '}
                  <span className="text-slate-900">
                    {hoveredPoint.value}
                    {currentCfg.unit}
                  </span>{' '}
                  <span className="text-[11px] text-slate-500 font-normal">
                    ({formatTime(hoveredPoint.timestamp)})
                  </span>
                </div>
              )}
            </div>

            {/* Responsive SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[500px]"
                aria-label={currentCfg.title}
              >
                {/* Background Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding.top + innerHeight * (1 - ratio);
                  const val = Math.round(minValue + ratio * range);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + innerWidth}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                        fontFamily="sans-serif"
                      >
                        {val}
                        {currentCfg.unit}
                      </text>
                    </g>
                  );
                })}

                {/* Healthy Range Shaded Band */}
                {healthyHeight > 0 && (
                  <rect
                    x={padding.left}
                    y={Math.max(padding.top, healthyTopY)}
                    width={innerWidth}
                    height={healthyHeight}
                    fill="#10b981"
                    fillOpacity="0.06"
                  />
                )}

                {/* Gradient Fill under the line */}
                {areaPath && (
                  <path d={areaPath} fill={currentCfg.color} fillOpacity="0.08" />
                )}

                {/* Trend Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={currentCfg.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === pt ? 5 : 3.5}
                    fill="#ffffff"
                    stroke={currentCfg.color}
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* X Axis Date labels (First and Last) */}
                {points.length > 0 && (
                  <>
                    <text
                      x={points[0].x}
                      y={svgHeight - 10}
                      textAnchor="start"
                      fontSize="10"
                      fill="#94a3b8"
                      fontFamily="sans-serif"
                    >
                      {formatDate(points[0].timestamp)} {formatTime(points[0].timestamp)}
                    </text>
                    {points.length > 1 && (
                      <text
                        x={points[points.length - 1].x}
                        y={svgHeight - 10}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                        fontFamily="sans-serif"
                      >
                        {formatTime(points[points.length - 1].timestamp)}
                      </text>
                    )}
                  </>
                )}
              </svg>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
