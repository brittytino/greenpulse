import React, { useState } from 'react';
import { useReadings } from '../hooks/useReadings';
import { useToast } from '../hooks/useToast';
import { SummaryCards } from '../components/SummaryCards';
import { BedGrid } from '../components/BedGrid';
import { TrendCharts } from '../components/TrendCharts';
import { ReadingHistoryTable } from '../components/ReadingHistoryTable';
import { AddReadingModal } from '../components/AddReadingModal';
import { EditReadingModal } from '../components/EditReadingModal';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { BedDetailModal } from '../components/BedDetailModal';
import { Header } from '../components/Header';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ToastContainer } from '../components/ToastContainer';
import { SensorReading, CreateReadingDTO, UpdateReadingDTO } from '../types';
import { AlertCircle, RefreshCw, Sprout } from 'lucide-react';
import { Button } from '../components/UI/Button';

export const DashboardPage: React.FC = () => {
  const {
    readings,
    bedSummaries,
    statistics,
    isLoading,
    isRefreshing,
    errorMessage,
    lastSynchronized,
    isSimulating,
    setIsSimulating,
    refetch,
    refreshSilently,
    createReading,
    updateReading,
    deleteReading,
  } = useReadings();

  const { toasts, removeToast, success, error } = useToast();

  // Modal and dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalInitialBed, setAddModalInitialBed] = useState<string>('BED-01');
  const [editingReading, setEditingReading] = useState<SensorReading | null>(null);
  const [deletingReading, setDeletingReading] = useState<SensorReading | null>(null);
  const [selectedDetailBedId, setSelectedDetailBedId] = useState<string | null>(null);

  // Handlers for Add Reading
  const handleOpenAddModal = (bedId = 'BED-01') => {
    setAddModalInitialBed(bedId);
    setIsAddModalOpen(true);
  };

  const handleCreateReading = async (data: CreateReadingDTO) => {
    try {
      const created = await createReading(data);
      success('Reading Recorded', `New reading saved for ${created.bedId} (${created.soilMoisture}% moisture, ${created.temperature}°C).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create reading.';
      error('Creation Failed', msg);
      throw err;
    }
  };

  // Handlers for Edit Reading
  const handleOpenEditModal = (reading: SensorReading) => {
    setEditingReading(reading);
  };

  const handleUpdateReading = async (id: string, data: UpdateReadingDTO) => {
    try {
      const updated = await updateReading(id, data);
      success('Reading Updated', `Reading for ${updated.bedId} was updated successfully.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update reading.';
      error('Update Failed', msg);
      throw err;
    }
  };

  // Handlers for Delete Reading
  const handleOpenDeleteDialog = (reading: SensorReading) => {
    setDeletingReading(reading);
  };

  const handleDeleteReading = async (id: string) => {
    try {
      await deleteReading(id);
      success('Reading Removed', 'The sensor reading was permanently removed.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove reading.';
      error('Deletion Failed', msg);
      throw err;
    }
  };

  // Find currently selected bed for details modal
  const selectedBedSummary = selectedDetailBedId
    ? bedSummaries.find((b) => b.bedId === selectedDetailBedId)
    : null;

  return (
    <DashboardLayout
      header={
        <Header
          onRefresh={refreshSilently}
          onOpenAddModal={() => handleOpenAddModal('BED-01')}
          isRefreshing={isRefreshing}
          lastSynchronized={lastSynchronized}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
        />
      }
    >
      {/* Primary UI State Switcher */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-agri-100 text-agri-700 flex items-center justify-center animate-pulse shadow-sm">
            <Sprout className="w-6 h-6 animate-bounce" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-slate-800">
              Synchronizing Greenhouse Telemetry...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Fetching real-time metrics across all monitored micro-climate beds
            </p>
          </div>
        </div>
      ) : errorMessage && readings.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 bg-white rounded-2xl border border-rose-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Communication Error</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4">{errorMessage}</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry Connection
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Top Summary Cards */}
          <section aria-label="Greenhouse Overview Metrics">
            <SummaryCards statistics={statistics} />
          </section>

          {/* Section 2: Greenhouse Bed Monitoring Grid */}
          <section aria-label="Greenhouse Bed Monitoring">
            <BedGrid
              beds={bedSummaries}
              onSelectBed={(bedId) => setSelectedDetailBedId(bedId)}
              onAddReadingForBed={(bedId) => handleOpenAddModal(bedId)}
            />
          </section>

          {/* Section 3: Trend Charts Section */}
          <section aria-label="Agronomic Trends">
            <TrendCharts readings={readings} />
          </section>

          {/* Section 4: Reading History & Audit Table */}
          <section aria-label="Reading History and Logs">
            <ReadingHistoryTable
              readings={readings}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteDialog}
              onAddReading={() => handleOpenAddModal('BED-01')}
            />
          </section>
        </div>
      )}

      {/* Modals & Dialogs */}
      <AddReadingModal
        isOpen={isAddModalOpen}
        initialBedId={addModalInitialBed}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateReading}
      />

      <EditReadingModal
        isOpen={!!editingReading}
        reading={editingReading}
        onClose={() => setEditingReading(null)}
        onSubmit={handleUpdateReading}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingReading}
        reading={deletingReading}
        onClose={() => setDeletingReading(null)}
        onConfirm={handleDeleteReading}
      />

      {selectedBedSummary && (
        <BedDetailModal
          bed={selectedBedSummary}
          readings={readings}
          onClose={() => setSelectedDetailBedId(null)}
          onAddReading={(bedId) => {
            setSelectedDetailBedId(null);
            handleOpenAddModal(bedId);
          }}
          onEditReading={(r) => {
            setSelectedDetailBedId(null);
            handleOpenEditModal(r);
          }}
          onDeleteReading={(r) => {
            setSelectedDetailBedId(null);
            handleOpenDeleteDialog(r);
          }}
        />
      )}

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </DashboardLayout>
  );
};
