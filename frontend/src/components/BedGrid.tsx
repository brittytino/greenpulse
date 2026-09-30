import React, { useState } from 'react';
import { BedSummary } from '../types';
import { BedCard } from './BedCard';
import { Filter } from 'lucide-react';

interface BedGridProps {
  beds: BedSummary[];
  onSelectBed: (bedId: string) => void;
  onAddReadingForBed: (bedId: string) => void;
}

export const BedGrid: React.FC<BedGridProps> = ({
  beds,
  onSelectBed,
  onAddReadingForBed,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBeds = beds.filter((bed) => {
    if (statusFilter === 'all') return true;
    return bed.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-4">
      {/* Section Header with Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Greenhouse Bed Monitoring
          </h2>
          <p className="text-xs text-slate-500">
            Real-time conditions across all 8 micro-climate monitored beds
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter:</span>
          </div>

          {(['all', 'Healthy', 'Warning', 'Critical'] as const).map((status) => {
            const isSelected = statusFilter === status;
            const count =
              status === 'all'
                ? beds.length
                : beds.filter((b) => b.status === status).length;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{status === 'all' ? 'All Beds' : status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Bed Cards */}
      {filteredBeds.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            No greenhouse beds match the &quot;{statusFilter}&quot; status filter.
          </p>
          <button
            onClick={() => setStatusFilter('all')}
            className="mt-2 text-xs font-semibold text-agri-700 hover:underline"
          >
            Clear status filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBeds.map((bed) => (
            <BedCard
              key={bed.bedId}
              bed={bed}
              onSelectBed={onSelectBed}
              onAddReadingForBed={onAddReadingForBed}
            />
          ))}
        </div>
      )}
    </div>
  );
};
