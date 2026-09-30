import { SensorReading } from '../types/index.js';

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;

const INITIAL_BACKEND_READINGS: SensorReading[] = [
  // BED-01 (Healthy)
  {
    id: 'rdg-bed01-01',
    bedId: 'BED-01',
    timestamp: new Date(now - 3 * minute).toISOString(),
    soilMoisture: 64.8,
    temperature: 24.5,
    humidity: 68.2,
    source: 'sensor',
    createdAt: new Date(now - 3 * minute).toISOString(),
    updatedAt: new Date(now - 3 * minute).toISOString(),
  },
  {
    id: 'rdg-bed01-02',
    bedId: 'BED-01',
    timestamp: new Date(now - 35 * minute).toISOString(),
    soilMoisture: 66.2,
    temperature: 24.1,
    humidity: 69.5,
    source: 'sensor',
    createdAt: new Date(now - 35 * minute).toISOString(),
    updatedAt: new Date(now - 35 * minute).toISOString(),
  },

  // BED-02 (Warning)
  {
    id: 'rdg-bed02-01',
    bedId: 'BED-02',
    timestamp: new Date(now - 7 * minute).toISOString(),
    soilMoisture: 35.4,
    temperature: 27.8,
    humidity: 74.0,
    source: 'sensor',
    createdAt: new Date(now - 7 * minute).toISOString(),
    updatedAt: new Date(now - 7 * minute).toISOString(),
  },

  // BED-03 (Healthy)
  {
    id: 'rdg-bed03-01',
    bedId: 'BED-03',
    timestamp: new Date(now - 12 * minute).toISOString(),
    soilMoisture: 71.5,
    temperature: 22.4,
    humidity: 63.8,
    source: 'sensor',
    createdAt: new Date(now - 12 * minute).toISOString(),
    updatedAt: new Date(now - 12 * minute).toISOString(),
  },

  // BED-04 (Critical)
  {
    id: 'rdg-bed04-01',
    bedId: 'BED-04',
    timestamp: new Date(now - 5 * minute).toISOString(),
    soilMoisture: 24.2,
    temperature: 37.6,
    humidity: 26.5,
    source: 'sensor',
    createdAt: new Date(now - 5 * minute).toISOString(),
    updatedAt: new Date(now - 5 * minute).toISOString(),
  },

  // BED-05 (Healthy)
  {
    id: 'rdg-bed05-01',
    bedId: 'BED-05',
    timestamp: new Date(now - 18 * minute).toISOString(),
    soilMoisture: 59.2,
    temperature: 25.1,
    humidity: 71.5,
    source: 'sensor',
    createdAt: new Date(now - 18 * minute).toISOString(),
    updatedAt: new Date(now - 18 * minute).toISOString(),
  },

  // BED-06 (Warning)
  {
    id: 'rdg-bed06-01',
    bedId: 'BED-06',
    timestamp: new Date(now - 22 * minute).toISOString(),
    soilMoisture: 84.6,
    temperature: 21.2,
    humidity: 87.4,
    source: 'sensor',
    createdAt: new Date(now - 22 * minute).toISOString(),
    updatedAt: new Date(now - 22 * minute).toISOString(),
  },

  // BED-07 (Healthy)
  {
    id: 'rdg-bed07-01',
    bedId: 'BED-07',
    timestamp: new Date(now - 15 * minute).toISOString(),
    soilMoisture: 62.7,
    temperature: 23.9,
    humidity: 65.4,
    source: 'sensor',
    createdAt: new Date(now - 15 * minute).toISOString(),
    updatedAt: new Date(now - 15 * minute).toISOString(),
  },

  // BED-08 (Critical)
  {
    id: 'rdg-bed08-01',
    bedId: 'BED-08',
    timestamp: new Date(now - 9 * minute).toISOString(),
    soilMoisture: 93.8,
    temperature: 14.8,
    humidity: 93.0,
    source: 'sensor',
    createdAt: new Date(now - 9 * minute).toISOString(),
    updatedAt: new Date(now - 9 * minute).toISOString(),
  },
  {
    id: 'rdg-bed08-02',
    bedId: 'BED-08',
    timestamp: new Date(now - 2 * hour).toISOString(),
    soilMoisture: 91.5,
    temperature: 15.5,
    humidity: 90.8,
    source: 'manual',
    createdAt: new Date(now - 2 * hour).toISOString(),
    updatedAt: new Date(now - 2 * hour).toISOString(),
  },
];

class MemoryStore {
  private readings: Map<string, SensorReading> = new Map();

  constructor() {
    INITIAL_BACKEND_READINGS.forEach((r) => this.readings.set(r.id, { ...r }));
  }

  async getAll(bedId?: string): Promise<SensorReading[]> {
    const list = Array.from(this.readings.values());
    let filtered = list;
    if (bedId) {
      filtered = list.filter((r) => r.bedId === bedId);
    }
    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getById(id: string): Promise<SensorReading | null> {
    return this.readings.get(id) || null;
  }

  async create(reading: SensorReading): Promise<SensorReading> {
    this.readings.set(reading.id, { ...reading });
    return reading;
  }

  async update(id: string, updates: Partial<SensorReading>): Promise<SensorReading | null> {
    const existing = this.readings.get(id);
    if (!existing) return null;

    const updated: SensorReading = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.readings.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.readings.delete(id);
  }
}

export const memoryStore = new MemoryStore();
