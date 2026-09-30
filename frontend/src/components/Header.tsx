import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Sprout, Activity, Zap } from 'lucide-react';
import { Button } from './UI/Button';
import { formatTime } from '../utils/dateUtils';

interface HeaderProps {
  onRefresh: () => void;
  onOpenAddModal: () => void;
  isRefreshing: boolean;
  lastSynchronized: Date | null;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  isUsingLocalMock: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onOpenAddModal,
  isRefreshing,
  lastSynchronized,
  isSimulating,
  onToggleSimulation,
  isUsingLocalMock,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-md shadow-agri-600/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">GreenPulse</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-agri-100 text-agri-800 uppercase tracking-wider">
                  Urban Agriculture
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Greenhouse Monitoring Dashboard
              </p>
            </div>
          </div>

          {/* Status indicators & Actions */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between md:justify-end">
            {/* System Status & Current Time */}
            <div className="flex items-center gap-3 text-xs text-slate-600 border-r border-slate-200 pr-3 sm:pr-4">
              <div className="flex items-center gap-1.5" title={isUsingLocalMock ? 'Running on Client Storage Fallback' : 'Connected to API'}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-800">System Online</span>
              </div>

              <div className="hidden lg:block text-slate-400">|</div>

              <div className="hidden lg:flex items-center gap-1 text-slate-500">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentDateTime}</span>
              </div>

              <div className="hidden sm:block text-slate-400">|</div>

              <div className="text-slate-500">
                <span>Last synchronized: </span>
                <span className="font-medium text-slate-700">
                  {lastSynchronized ? formatTime(lastSynchronized.toISOString()) : 'Syncing...'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Simulation Toggle */}
              <button
                onClick={onToggleSimulation}
                type="button"
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                  isSimulating
                    ? 'bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title={isSimulating ? 'Sensor simulation active (transmitting mock readings)' : 'Enable simulated incoming sensor telemetry'}
              >
                <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-teal-600 fill-teal-500' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Simulation</span>
                <span className={`text-[10px] px-1 rounded font-bold uppercase ${isSimulating ? 'bg-teal-200/80 text-teal-800' : 'bg-slate-200 text-slate-600'}`}>
                  {isSimulating ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                isLoading={isRefreshing}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
                title="Refresh readings now"
                aria-label="Refresh dashboard data"
              >
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              {/* Add Reading Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenAddModal}
                leftIcon={<Plus className="w-4 h-4" />}
                id="btn-add-reading-header"
              >
                <span>Add Reading</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
