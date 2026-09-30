import { apiClient } from './api';
import { SensorReading, CreateReadingDTO, UpdateReadingDTO } from '../types';
import { BED_IDS } from '../config/thresholds';

class ReadingsService {
  /**
   * Fetch all readings from the AWS API Gateway, optionally filtered by bedId
   */
  async getReadings(bedId?: string): Promise<SensorReading[]> {
    const endpoint = bedId ? `/readings?bedId=${encodeURIComponent(bedId)}` : '/readings';
    const response = await apiClient<SensorReading[]>(endpoint, { method: 'GET' });
    const list = response.data || [];
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Fetch a single sensor reading by ID from AWS API Gateway
   */
  async getReading(id: string): Promise<SensorReading> {
    const response = await apiClient<SensorReading>(`/readings/${id}`, { method: 'GET' });
    if (!response.data) {
      throw new Error(`Reading with ID "${id}" was not found.`);
    }
    return response.data;
  }

  /**
   * Create a new sensor reading via POST /readings on AWS API Gateway
   */
  async createReading(input: CreateReadingDTO): Promise<SensorReading> {
    const payload: CreateReadingDTO = {
      ...input,
      timestamp: input.timestamp || new Date().toISOString(),
      source: input.source || 'manual',
    };

    const response = await apiClient<SensorReading>('/readings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.data) {
      throw new Error('Failed to create sensor reading on server.');
    }
    return response.data;
  }

  /**
   * Update an existing sensor reading via PUT /readings/{id} on AWS API Gateway
   */
  async updateReading(id: string, input: UpdateReadingDTO): Promise<SensorReading> {
    const response = await apiClient<SensorReading>(`/readings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });

    if (!response.data) {
      throw new Error(`Failed to update sensor reading with ID "${id}".`);
    }
    return response.data;
  }

  /**
   * Delete a sensor reading via DELETE /readings/{id} on AWS API Gateway
   */
  async deleteReading(id: string): Promise<void> {
    await apiClient(`/readings/${id}`, { method: 'DELETE' });
  }

  /**
   * Simulation mode sensor reading generator (used when Simulation toggle is ON)
   */
  async generateSimulatedReading(bedId?: string): Promise<SensorReading> {
    const targetBed = bedId || BED_IDS[Math.floor(Math.random() * BED_IDS.length)];
    
    // Generate realistic fluctuating values for simulation
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
}

export const readingsService = new ReadingsService();
