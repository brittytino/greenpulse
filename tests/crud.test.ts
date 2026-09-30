import { describe, it, expect, beforeEach } from 'vitest';
import { memoryStore } from '../backend/src/services/memoryStore';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  createReadingHandler,
  getReadingsHandler,
  getReadingByIdHandler,
  updateReadingHandler,
  deleteReadingHandler,
  handler as unifiedHandler,
} from '../backend/src/handlers/index';

function createMockEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    ...overrides,
  };
}

describe('Sensor Reading CRUD Flow via AWS Lambda Handlers', () => {
  let createdId: string;

  it('GET /readings returns initial dataset with 200 OK', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/readings' });
    const res = await getReadingsHandler(event);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('POST /readings creates a new reading with 201 Created and auto-generated ID', async () => {
    const payload = {
      bedId: 'BED-03',
      soilMoisture: 58.4,
      temperature: 23.8,
      humidity: 62.0,
      source: 'manual',
    };

    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/readings',
      body: JSON.stringify(payload),
    });

    const res = await createReadingHandler(event);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.bedId).toBe('BED-03');
    expect(body.data.soilMoisture).toBe(58.4);
    expect(body.data.createdAt).toBeDefined();
    expect(body.data.updatedAt).toBeDefined();

    createdId = body.data.id;
  });

  it('GET /readings/{id} fetches the created reading', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: `/readings/${createdId}`,
      pathParameters: { id: createdId },
    });

    const res = await getReadingByIdHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdId);
    expect(body.data.bedId).toBe('BED-03');
  });

  it('PUT /readings/{id} updates values while preserving ID and createdAt', async () => {
    // Fetch initial to record createdAt
    const initialGet = await getReadingByIdHandler(
      createMockEvent({ pathParameters: { id: createdId } })
    );
    const initialRecord = JSON.parse(initialGet.body).data;

    const updatePayload = {
      soilMoisture: 60.0,
      temperature: 25.0,
    };

    const event = createMockEvent({
      httpMethod: 'PUT',
      path: `/readings/${createdId}`,
      pathParameters: { id: createdId },
      body: JSON.stringify(updatePayload),
    });

    const res = await updateReadingHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdId);
    expect(body.data.soilMoisture).toBe(60.0);
    expect(body.data.temperature).toBe(25.0);
    expect(body.data.humidity).toBe(initialRecord.humidity); // preserved
    expect(body.data.createdAt).toBe(initialRecord.createdAt); // preserved
  });

  it('DELETE /readings/{id} removes the reading permanently', async () => {
    const event = createMockEvent({
      httpMethod: 'DELETE',
      path: `/readings/${createdId}`,
      pathParameters: { id: createdId },
    });

    const res = await deleteReadingHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);

    // Verify reading is no longer found
    const verifyGet = await getReadingByIdHandler(event);
    expect(verifyGet.statusCode).toBe(404);
  });

  it('GET /readings with bedId filter returns only matching bed readings', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/readings',
      queryStringParameters: { bedId: 'BED-01' },
    });

    const res = await getReadingsHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    body.data.forEach((r: any) => {
      expect(r.bedId).toBe('BED-01');
    });
  });

  it('POST /readings rejects invalid inputs with 400 Bad Request', async () => {
    const invalidPayload = {
      bedId: 'INVALID_BED',
      soilMoisture: 150, // Out of bounds
    };

    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/readings',
      body: JSON.stringify(invalidPayload),
    });

    const res = await createReadingHandler(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.errors).toBeDefined();
  });
});

describe('Unified Single-Lambda Handler (GreenPulseAPI)', () => {
  let createdReadingId: string;

  it('routes OPTIONS preflight with 204 No Content', async () => {
    const event = createMockEvent({ httpMethod: 'OPTIONS', path: '/readings' });
    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(204);
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });

  it('routes GET /health with 200 OK', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/health' });
    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
  });

  it('routes POST /readings through single handler', async () => {
    const payload = {
      bedId: 'BED-06',
      soilMoisture: 55.0,
      temperature: 22.0,
      humidity: 60.0,
      source: 'manual',
    };
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/readings',
      body: JSON.stringify(payload),
    });

    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.bedId).toBe('BED-06');
    createdReadingId = body.data.id;
  });

  it('routes GET /readings with query string through single handler', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/readings',
      queryStringParameters: { bedId: 'BED-06' },
    });

    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].bedId).toBe('BED-06');
  });

  it('routes GET /readings/{id} with path parameter through single handler', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: `/readings/${createdReadingId}`,
      pathParameters: { id: createdReadingId },
    });

    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdReadingId);
  });

  it('routes PUT /readings/{id} with path parameter through single handler', async () => {
    const event = createMockEvent({
      httpMethod: 'PUT',
      path: `/readings/${createdReadingId}`,
      pathParameters: { id: createdReadingId },
      body: JSON.stringify({ soilMoisture: 57.5 }),
    });

    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.soilMoisture).toBe(57.5);
  });

  it('routes DELETE /readings/{id} through single handler', async () => {
    const event = createMockEvent({
      httpMethod: 'DELETE',
      path: `/readings/${createdReadingId}`,
      pathParameters: { id: createdReadingId },
    });

    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it('returns 404 for unknown routes', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/unknown-route',
    });

    const res = await unifiedHandler(event);
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
  });
});

