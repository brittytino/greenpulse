import { apiClient, ApiError } from './api';
import { SensorReading, CreateReadingDTO, UpdateReadingDTO } from '../types';
import { INITIAL_MOCK_READINGS } from '../data/mockReadings';
import { BED_IDS } from '../config/thresholds';

const STORAGE_KEY = 'greenpulse_sensor_readings_v1';

// In-memory / LocalStorage cache for local offline fallback
function getLocalReadings(): SensorReading[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_READINGS));
      return [...INITIAL_MOCK_READINGS];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_MOCK_READINGS];
  }
}

function saveLocalReadings(readings: SensorReading[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch {
    // Local storage quota or unavailable
  }
}

class ReadingsService {
  private useLocalFallbackMode = false;

  /**
   * Check if service is currently falling back to browser storage
   */
  public isUsingLocalStore(): boolean {
    return this.useLocalFallbackMode;
  }

  /**
   * Fetch all readings, optionally filtered by bedId
   */
  async getReadings(bedId?: string): Promise<SensorReading[]> {
    try {
      const endpoint = bedId ? `/readings?bedId=${encodeURIComponent(bedId)}` : '/readings';
      const response = await apiClient<SensorReading[]>(endpoint, { method: 'GET' });
      this.useLocalFallbackMode = false;
      return response.data || [];
    } catch (err) {
      // If network failure or backend not yet started, seamlessly use local fallback
      if (err instanceof ApiError && (err.statusCode === 0 || err.statusCode === 404)) {
        this.useLocalFallbackMode = true;
        let list = getLocalReadings();
        if (bedId) {
          list = list.filter((r) => r.bedId === bedId);
        }
        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      throw err;
    }
  }

  /**
   * Fetch a single sensor reading by ID
   */
  async getReading(id: string): Promise<SensorReading> {
    try {
      const response = await apiClient<SensorReading>(`/readings/${id}`, { method: 'GET' });
      this.useLocalFallbackMode = false;
      if (!response.data) throw new Error('Reading not found');
      return response.data;
    } catch (err) {
      if (err instanceof ApiError && (err.statusCode === 0 || err.statusCode === 404)) {
        this.useLocalFallbackMode = true;
        const list = getLocalReadings();
        const found = list.find((r) => r.id === id);
        if (!found) throw new Error(`Reading with ID "${id}" was not found.`);
        return found;
      }
      throw err;
    }
  }

  /**
   * Create a new sensor reading
   */
  async createReading(input: CreateReadingDTO): Promise<SensorReading> {
    const payload: CreateReadingDTO = {
      ...input,
      timestamp: input.timestamp || new Date().toISOString(),
      source: input.source || 'manual',
    };

    try {
      const response = await apiClient<SensorReading>('/readings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.useLocalFallbackMode = false;
      if (!response.data) throw new Error('Failed to create sensor reading');
      return response.data;
    } catch (err) {
      if (err instanceof ApiError && (err.statusCode === 0 || err.statusCode === 404)) {
        this.useLocalFallbackMode = true;
        const list = getLocalReadings();
        const nowIso = new Date().toISOString();
        const newReading: SensorReading = {
          id: `rdg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          bedId: payload.bedId,
          soilMoisture: Number(payload.soilMoisture),
          temperature: Number(payload.temperature),
          humidity: Number(payload.humidity),
          timestamp: payload.timestamp || nowIso,
          source: payload.source || 'manual',
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        list.unshift(newReading);
        saveLocalReadings(list);
        return newReading;
      }
      throw err;
    }
  }

  /**
   * Update an existing sensor reading
   */
  async updateReading(id: string, input: UpdateReadingDTO): Promise<SensorReading> {
    try {
      const response = await apiClient<SensorReading>(`/readings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      this.useLocalFallbackMode = false;
      if (!response.data) throw new Error('Failed to update sensor reading');
      return response.data;
    } catch (err) {
      if (err instanceof ApiError && (err.statusCode === 0 || err.statusCode === 404)) {
        this.useLocalFallbackMode = true;
        const list = getLocalReadings();
        const index = list.findIndex((r) => r.id === id);
        if (index === -1) {
          throw new Error(`Sensor reading "${id}" not found.`);
        }
        const existing = list[index];
        const nowIso = new Date().toISOString();
        const updated: SensorReading = {
          ...existing,
          ...input,
          id: existing.id,
          createdAt: existing.createdAt, // Preserve creation timestamp
          updatedAt: nowIso,
          soilMoisture: input.soilMoisture !== undefined ? Number(input.soilMoisture) : existing.soilMoisture,
          temperature: input.temperature !== undefined ? Number(input.temperature) : existing.temperature,
          humidity: input.humidity !== undefined ? Number(input.humidity) : existing.humidity,
        };
        list[index] = updated;
        saveLocalReadings(list);
        return updated;
      }
      throw err;
    }
  }

  /**
   * Delete a sensor reading
   */
  async deleteReading(id: string): Promise<void> {
    try {
      await apiClient(`/readings/${id}`, { method: 'DELETE' });
      this.useLocalFallbackMode = false;
    } catch (err) {
      if (err instanceof ApiError && (err.statusCode === 0 || err.statusCode === 404)) {
        this.useLocalFallbackMode = true;
        const list = getLocalReadings();
        const filtered = list.filter((r) => r.id !== id);
        saveLocalReadings(filtered);
        return;
      }
      throw err;
    }
  }

  /**
   * Development-only sensor reading generator for simulation mode
   */
  async generateSimulatedReading(bedId?: string): Promise<SensorReading> {
    const targetBed = bedId || BED_IDS[Math.floor(Math.random() * BED_IDS.length)];
    
    // Generate realistic fluctuating values
    const soilMoisture = Math.round((45 + Math.random() * 35) * 10) / 10;
    const temperature = Math.round((21 + Math.random() * 9) * 10) / 10;
    const humidity = Math.round((55 + Math.random() * 25) * 10) / 10;

    return this.createReading({
      bedId: targetBed,
      soilMoisture,
      temperature,
      humidity,
      source: 'simulated',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Reset local storage data to initial realistic seed
   */
  resetLocalData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_READINGS));
  }
}

export const readingsService = new ReadingsService();
