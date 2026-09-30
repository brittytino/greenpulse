import React from 'react';
import { HealthStatus, SensorReadingSource } from '../../types';
import { getStatusStyle, getSourceStyle } from '../../utils/statusUtils';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: HealthStatus | SensorReadingSource | 'default';
  className?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  showDot = false,
}) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['Healthy', 'Warning', 'Critical', 'Offline'].includes(variant)) {
    const s = getStatusStyle(variant as HealthStatus);
    bg = `${s.badgeBg} ${s.badgeText} ${s.badgeBorder}`;
    dotColor = s.dotColor;
  } else if (['sensor', 'manual', 'simulated'].includes(variant)) {
    const s = getSourceStyle(variant as SensorReadingSource);
    bg = `${s.badgeBg} ${s.badgeText} ${s.badgeBorder}`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0 animate-pulse`}
          aria-hidden="true"
        />
      )}
      {children || variant}
    </span>
  );
};
