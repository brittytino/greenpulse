import React, { useState, useMemo } from 'react';
import { SensorReading } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './UI/Card';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/dateUtils';
import { calculateReadingHealthStatus } from '../config/thresholds';
import { BED_IDS } from '../config/thresholds';

interface ReadingHistoryTableProps {
  readings: SensorReading[];
  onEdit: (reading: SensorReading) => void;
  onDelete: (reading: SensorReading) => void;
  onAddReading: () => void;
}

export const ReadingHistoryTable: React.FC<ReadingHistoryTableProps> = ({
  readings,
  onEdit,
  onDelete,
  onAddReading,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBed, setSelectedBed] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter and sort readings
  const filteredReadings = useMemo(() => {
    return readings
      .filter((r) => {
        // Bed filter
        if (selectedBed !== 'ALL' && r.bedId !== selectedBed) {
          return false;
        }

        // Source filter
        if (selectedSource !== 'ALL' && r.source !== selectedSource) {
          return false;
        }

        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchBed = r.bedId.toLowerCase().includes(q);
          const matchId = r.id.toLowerCase().includes(q);
          const matchSource = r.source.toLowerCase().includes(q);
          const matchValues =
            r.soilMoisture.toString().includes(q) ||
            r.temperature.toString().includes(q) ||
            r.humidity.toString().includes(q);
          if (!matchBed && !matchId && !matchSource && !matchValues) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [readings, selectedBed, selectedSource, searchQuery, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReadings.length / pageSize) || 1;
  const paginatedReadings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReadings.slice(start, start + pageSize);
  }, [filteredReadings, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <Card className="overflow-hidden">
      {/* Table Header & Controls */}
      <CardHeader className="flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Sensor Reading History
            </CardTitle>
            <p className="text-xs text-slate-500">
              Audit log of verified manual entries, automated sensor telemetry, and simulation events
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onAddReading}
            leftIcon={<Plus className="w-4 h-4" />}
            id="btn-add-reading-table"
          >
            Add Reading
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 w-full pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bed, ID, value..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-agri-500 focus:border-agri-500"
              aria-label="Search readings"
            />
          </div>

          {/* Bed Filter */}
          <div className="relative">
            <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedBed}
              onChange={(e) => {
                setSelectedBed(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-7 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-agri-500 appearance-none bg-no-repeat bg-[right_0.6rem_center] bg-[length:1em_1em]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              }}
              aria-label="Filter by bed"
            >
              <option value="ALL">All Beds (BED-01 to 08)</option>
              {BED_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-7 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-agri-500 appearance-none bg-no-repeat bg-[right_0.6rem_center] bg-[length:1em_1em]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              }}
              aria-label="Filter by source"
            >
              <option value="ALL">All Sources</option>
              <option value="sensor">Sensor Only</option>
              <option value="manual">Manual Only</option>
              <option value="simulated">Simulated Only</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={toggleSort}
            className="w-full text-xs font-medium rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            aria-label="Toggle sort order by date"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </span>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredReadings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No sensor readings found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add a manual reading to begin monitoring this greenhouse bed, or try adjusting your search filters.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBed('ALL');
                  setSelectedSource('ALL');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="py-3 px-4">Bed</th>
                    <th scope="col" className="py-3 px-4">Date</th>
                    <th scope="col" className="py-3 px-4">Time</th>
                    <th scope="col" className="py-3 px-4">Soil Moisture</th>
                    <th scope="col" className="py-3 px-4">Temperature</th>
                    <th scope="col" className="py-3 px-4">Humidity</th>
                    <th scope="col" className="py-3 px-4">Source</th>
                    <th scope="col" className="py-3 px-4">Status</th>
                    <th scope="col" className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedReadings.map((r) => {
                    const status = calculateReadingHealthStatus(r);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {r.bedId}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {formatDate(r.timestamp)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {formatTime(r.timestamp)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-700">
                          {r.soilMoisture}%
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-700">
                          {r.temperature}°C
                        </td>
                        <td className="py-3 px-4 font-semibold text-teal-700">
                          {r.humidity}%
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={r.source} />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={status} showDot />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEdit(r)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit reading"
                              aria-label={`Edit reading ${r.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(r)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete reading"
                              aria-label={`Delete reading ${r.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout (shown on screens < md) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {paginatedReadings.map((r) => {
                const status = calculateReadingHealthStatus(r);
                return (
                  <div
                    key={r.id}
                    className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {r.bedId}
                        </span>
                        <Badge variant={status} showDot />
                      </div>
                      <Badge variant={r.source} />
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>{formatDate(r.timestamp)}</span>
                      <span>{formatTime(r.timestamp)}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 text-center bg-white rounded-lg border border-slate-100 p-2">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Moisture</div>
                        <div className="text-xs font-bold text-blue-700">{r.soilMoisture}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Temp</div>
                        <div className="text-xs font-bold text-amber-700">{r.temperature}°C</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Humidity</div>
                        <div className="text-xs font-bold text-teal-700">{r.humidity}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(r)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(r)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {filteredReadings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredReadings.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-800">{filteredReadings.length}</span>{' '}
                readings
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Prev</span>
                </Button>

                <div className="px-2 font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
