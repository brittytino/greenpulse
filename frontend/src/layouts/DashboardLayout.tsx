import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, header }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {header}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">GreenPulse</span>
            <span>•</span>
            <span>Urban Agricultural Community Greenhouse Telemetry</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Serverless Ready: Amplify → API Gateway → Lambda → DynamoDB</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-500">v1.0.0-lab</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
