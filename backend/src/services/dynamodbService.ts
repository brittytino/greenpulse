import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, isAwsConfigured } from '../config/dynamodb.js';
import { memoryStore } from './memoryStore.js';
import { SensorReading, CreateReadingDTO, UpdateReadingDTO } from '../types/index.js';

class DynamoDbService {
  /**
   * Get all readings, optionally filtered by bedId
   */
  async getReadings(bedId?: string): Promise<SensorReading[]> {
    if (!docClient || !isAwsConfigured) {
      return memoryStore.getAll(bedId);
    }

    try {
      if (bedId) {
        // Query Global Secondary Index: bedId-timestamp-index
        const command = new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'bedId-timestamp-index',
          KeyConditionExpression: 'bedId = :bedId',
          ExpressionAttributeValues: {
            ':bedId': bedId,
          },
          ScanIndexForward: false, // Descending by timestamp
        });
        const response = await docClient.send(command);
        return (response.Items as SensorReading[]) || [];
      } else {
        // Scan full table
        const command = new ScanCommand({
          TableName: TABLE_NAME,
        });
        const response = await docClient.send(command);
        const items = (response.Items as SensorReading[]) || [];
        return items.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    } catch (err) {
      console.warn('[DynamoDB Service] DynamoDB query failed, falling back to local store:', err);
      return memoryStore.getAll(bedId);
    }
  }

  /**
   * Get single reading by partition key (id)
   */
  async getReadingById(id: string): Promise<SensorReading | null> {
    if (!docClient || !isAwsConfigured) {
      return memoryStore.getById(id);
    }

    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      });
      const response = await docClient.send(command);
      return (response.Item as SensorReading) || null;
    } catch (err) {
      console.warn('[DynamoDB Service] DynamoDB get failed, falling back to local store:', err);
      return memoryStore.getById(id);
    }
  }

  /**
   * Create a new reading record
   */
  async createReading(input: CreateReadingDTO): Promise<SensorReading> {
    const nowIso = new Date().toISOString();
    const newRecord: SensorReading = {
      id: `rdg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bedId: input.bedId,
      soilMoisture: Number(input.soilMoisture),
      temperature: Number(input.temperature),
      humidity: Number(input.humidity),
      timestamp: input.timestamp || nowIso,
      source: input.source || 'manual',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (!docClient || !isAwsConfigured) {
      return memoryStore.create(newRecord);
    }

    try {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: newRecord,
      });
      await docClient.send(command);
      return newRecord;
    } catch (err) {
      console.warn('[DynamoDB Service] DynamoDB put failed, saving to local store:', err);
      return memoryStore.create(newRecord);
    }
  }

  /**
   * Update an existing sensor reading record
   */
  async updateReading(id: string, input: UpdateReadingDTO): Promise<SensorReading | null> {
    if (!docClient || !isAwsConfigured) {
      return memoryStore.update(id, input);
    }

    try {
      // First verify existing record to preserve createdAt
      const existing = await this.getReadingById(id);
      if (!existing) return null;

      const nowIso = new Date().toISOString();
      const updatedRecord: SensorReading = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: nowIso,
      };

      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: updatedRecord,
      });
      await docClient.send(command);
      return updatedRecord;
    } catch (err) {
      console.warn('[DynamoDB Service] DynamoDB update failed, updating in local store:', err);
      return memoryStore.update(id, input);
    }
  }

  /**
   * Delete a sensor reading record
   */
  async deleteReading(id: string): Promise<boolean> {
    if (!docClient || !isAwsConfigured) {
      return memoryStore.delete(id);
    }

    try {
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      });
      await docClient.send(command);
      return true;
    } catch (err) {
      console.warn('[DynamoDB Service] DynamoDB delete failed, deleting from local store:', err);
      return memoryStore.delete(id);
    }
  }
}

export const dynamodbService = new DynamoDbService();
