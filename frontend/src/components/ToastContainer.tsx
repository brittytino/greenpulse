import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200 bg-white text-slate-800';
        let Icon = Info;
        let iconColor = 'text-blue-500';

        switch (toast.type) {
          case 'success':
            borderClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-600';
            break;
          case 'error':
            borderClass = 'border-rose-200 bg-rose-50/95 text-rose-900';
            Icon = AlertCircle;
            iconColor = 'text-rose-600';
            break;
          case 'warning':
            borderClass = 'border-amber-200 bg-amber-50/95 text-amber-900';
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
            break;
          case 'info':
            borderClass = 'border-blue-200 bg-blue-50/95 text-blue-900';
            Icon = Info;
            iconColor = 'text-blue-600';
            break;
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-200 backdrop-blur-sm ${borderClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
            <div className="flex-1 text-sm min-w-0">
              <div className="font-semibold">{toast.title}</div>
              {toast.message && (
                <div className="text-xs opacity-90 mt-0.5 break-words">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors -mr-1 -mt-1 focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
