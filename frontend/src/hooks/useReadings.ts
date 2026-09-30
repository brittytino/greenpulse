import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SensorReading, DashboardStatistics, BedSummary, CreateReadingDTO, UpdateReadingDTO } from '../types';
import { readingsService } from '../services/readingsService';
import { GREENHOUSE_BEDS, calculateReadingHealthStatus } from '../config/thresholds';

export function useReadings() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSynchronized, setLastSynchronized] = useState<Date | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(20); // in seconds, 0 = paused
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const simulationTimerRef = useRef<number | null>(null);

  // Fetch readings from service
  const fetchReadings = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      const data = await readingsService.getReadings();
      setReadings(data);
      setLastSynchronized(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve sensor readings.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  // Real-time automatic polling timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const timer = setInterval(() => {
      fetchReadings(true);
    }, autoRefreshInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, fetchReadings]);

  // Development-only sensor simulation loop
  useEffect(() => {
    if (!isSimulating) {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      return;
    }

    simulationTimerRef.current = window.setInterval(async () => {
      try {
        await readingsService.generateSimulatedReading();
        // Refresh silently
        fetchReadings(true);
      } catch (err) {
        console.error('Sensor simulation failed:', err);
      }
    }, 8000); // generate new simulated reading every 8 seconds when simulation is ON

    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
    };
  }, [isSimulating, fetchReadings]);

  // Summaries per bed
  const bedSummaries: BedSummary[] = useMemo(() => {
    return GREENHOUSE_BEDS.map((bedDef) => {
      const bedReadings = readings
        .filter((r) => r.bedId === bedDef.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const latest = bedReadings[0];
      const status = calculateReadingHealthStatus(latest);

      return {
        bedId: bedDef.id,
        bedName: bedDef.name,
        greenhouseSection: bedDef.section,
        latestReading: latest,
        status,
        readingCount: bedReadings.length,
      };
    });
  }, [readings]);

  // Overall dashboard statistics
  const statistics: DashboardStatistics = useMemo(() => {
    const totalBeds = GREENHOUSE_BEDS.length;
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let offlineCount = 0;

    let totalMoisture = 0;
    let totalTemp = 0;
    let totalHumidity = 0;
    let bedsWithReadings = 0;

    bedSummaries.forEach((bed) => {
      switch (bed.status) {
        case 'Healthy':
          healthyCount++;
          break;
        case 'Warning':
          warningCount++;
          break;
        case 'Critical':
          criticalCount++;
          break;
        case 'Offline':
          offlineCount++;
          break;
      }

      if (bed.latestReading) {
        totalMoisture += bed.latestReading.soilMoisture;
        totalTemp += bed.latestReading.temperature;
        totalHumidity += bed.latestReading.humidity;
        bedsWithReadings++;
      }
    });

    const activeBeds = totalBeds - offlineCount;

    return {
      totalBeds,
      activeBeds: activeBeds > 0 ? activeBeds : totalBeds,
      averageSoilMoisture: bedsWithReadings > 0 ? Number((totalMoisture / bedsWithReadings).toFixed(1)) : 0,
      averageTemperature: bedsWithReadings > 0 ? Number((totalTemp / bedsWithReadings).toFixed(1)) : 0,
      averageHumidity: bedsWithReadings > 0 ? Number((totalHumidity / bedsWithReadings).toFixed(1)) : 0,
      healthyCount,
      warningCount,
      criticalCount,
      offlineCount,
      lastUpdated: lastSynchronized ? lastSynchronized.toISOString() : null,
    };
  }, [bedSummaries, lastSynchronized]);

  // CRUD actions
  const createReading = async (input: CreateReadingDTO): Promise<SensorReading> => {
    const result = await readingsService.createReading(input);
    await fetchReadings(true);
    return result;
  };

  const updateReading = async (id: string, input: UpdateReadingDTO): Promise<SensorReading> => {
    const result = await readingsService.updateReading(id, input);
    await fetchReadings(true);
    return result;
  };

  const deleteReading = async (id: string): Promise<void> => {
    await readingsService.deleteReading(id);
    await fetchReadings(true);
  };

  return {
    readings,
    bedSummaries,
    statistics,
    isLoading,
    isRefreshing,
    errorMessage,
    lastSynchronized,
    autoRefreshInterval,
    setAutoRefreshInterval,
    isSimulating,
    setIsSimulating,
    refetch: () => fetchReadings(false),
    refreshSilently: () => fetchReadings(true),
    createReading,
    updateReading,
    deleteReading,
  };
}
