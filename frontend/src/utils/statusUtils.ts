import { HealthStatus, SensorReadingSource } from '../types';

export interface StatusStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  cardBorder: string;
  accentColor: string;
}

export const STATUS_STYLES: Record<HealthStatus, StatusStyle> = {
  Healthy: {
    label: 'Healthy',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    cardBorder: 'border-emerald-200/70',
    accentColor: '#16a34a',
  },
  Warning: {
    label: 'Warning',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
    cardBorder: 'border-amber-200/70',
    accentColor: '#f59e0b',
  },
  Critical: {
    label: 'Critical',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
    cardBorder: 'border-rose-200/70',
    accentColor: '#e11d48',
  },
  Offline: {
    label: 'Offline',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    badgeBorder: 'border-slate-200',
    dotColor: 'bg-slate-400',
    cardBorder: 'border-slate-200',
    accentColor: '#94a3b8',
  },
};

export interface SourceStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const SOURCE_STYLES: Record<SensorReadingSource, SourceStyle> = {
  sensor: {
    label: 'Sensor',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
  },
  manual: {
    label: 'Manual',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  simulated: {
    label: 'Simulated',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
  },
};

export function getStatusStyle(status: HealthStatus): StatusStyle {
  return STATUS_STYLES[status] || STATUS_STYLES.Offline;
}

export function getSourceStyle(source: SensorReadingSource): SourceStyle {
  return SOURCE_STYLES[source] || SOURCE_STYLES.manual;
}
