import express, { Request, Response } from 'express';
import cors from 'cors';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  handler as lambdaHandler,
} from './handlers/index.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// Helper to convert Express Request into AWS APIGatewayProxyEvent
function toApiGatewayEvent(req: Request, pathParams: Record<string, string> = {}): APIGatewayProxyEvent {
  const queryParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.query)) {
    if (typeof v === 'string') queryParams[k] = v;
  }

  return {
    body: req.body ? JSON.stringify(req.body) : null,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    httpMethod: req.method,
    isBase64Encoded: false,
    path: req.path,
    pathParameters: pathParams,
    queryStringParameters: Object.keys(queryParams).length > 0 ? queryParams : null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: 'offlineContext',
      apiId: 'offlineApi',
      authorizer: {},
      protocol: 'HTTP/1.1',
      httpMethod: req.method,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: req.ip || '127.0.0.1',
        user: null,
        userAgent: req.get('user-agent') || null,
        userArn: null,
      },
      path: req.path,
      stage: 'dev',
      requestId: `req-${Date.now()}`,
      requestTimeEpoch: Date.now(),
      resourceId: 'offlineResource',
      resourcePath: req.path,
    },
    resource: req.path,
  };
}

// Route handlers delegating to the unified AWS Lambda dispatcher: GreenPulseAPI
app.get('/readings', async (req: Request, res: Response) => {
  const event = toApiGatewayEvent(req);
  const result = await lambdaHandler(event);
  res.status(result.statusCode).set(result.headers || {}).send(result.body);
});

app.get('/readings/:id', async (req: Request, res: Response) => {
  const event = toApiGatewayEvent(req, { id: String(req.params.id) });
  const result = await lambdaHandler(event);
  res.status(result.statusCode).set(result.headers || {}).send(result.body);
});

app.post('/readings', async (req: Request, res: Response) => {
  const event = toApiGatewayEvent(req);
  const result = await lambdaHandler(event);
  res.status(result.statusCode).set(result.headers || {}).send(result.body);
});

app.put('/readings/:id', async (req: Request, res: Response) => {
  const event = toApiGatewayEvent(req, { id: String(req.params.id) });
  const result = await lambdaHandler(event);
  res.status(result.statusCode).set(result.headers || {}).send(result.body);
});

app.delete('/readings/:id', async (req: Request, res: Response) => {
  const event = toApiGatewayEvent(req, { id: String(req.params.id) });
  const result = await lambdaHandler(event);
  res.status(result.statusCode).set(result.headers || {}).send(result.body);
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'GreenPulse Greenhouse Telemetry API',
    runtime: 'AWS Lambda compatible runner',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🌿 GreenPulse API Gateway local simulator running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/readings`);
  console.log(`   GET    http://localhost:${PORT}/readings/:id`);
  console.log(`   POST   http://localhost:${PORT}/readings`);
  console.log(`   PUT    http://localhost:${PORT}/readings/:id`);
  console.log(`   DELETE http://localhost:${PORT}/readings/:id`);
});
