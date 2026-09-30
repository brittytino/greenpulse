import React, { useState } from 'react';
import { SensorReading } from '../types';
import { Button } from './UI/Button';
import { AlertTriangle, X } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

interface DeleteConfirmDialogProps {
  reading: SensorReading | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  reading,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !reading) return null;

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      setIsDeleting(true);
      await onConfirm(reading.id);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to remove sensor reading.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Dialog Header */}
        <div className="px-6 pt-6 pb-2 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
              Delete Reading?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              This action will permanently remove this sensor reading from the database.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Cancel deletion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reading Preview */}
        <div className="px-6 py-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 text-xs space-y-1.5 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{reading.bedId}</span>
              <span className="text-slate-500 font-mono">{reading.id}</span>
            </div>
            <div>
              <span className="text-slate-500">Timestamp: </span>
              <span className="font-medium">{formatDateTime(reading.timestamp)}</span>
            </div>
            <div className="flex items-center gap-3 pt-1 text-slate-600">
              <span>Moisture: <strong className="text-slate-900">{reading.soilMoisture}%</strong></span>
              <span>Temp: <strong className="text-slate-900">{reading.temperature}°C</strong></span>
              <span>Humidity: <strong className="text-slate-900">{reading.humidity}%</strong></span>
            </div>
          </div>

          {errorMessage && (
            <p className="mt-2 text-xs text-rose-600 font-medium">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Reading
          </Button>
        </div>
      </div>
    </div>
  );
};
