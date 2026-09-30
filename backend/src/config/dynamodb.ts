import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'GreenhouseReadings';
export const REGION = process.env.AWS_REGION || 'us-east-1';

// Determine if we should attempt connecting to real DynamoDB or local DynamoDB
const isAwsConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID ||
  process.env.AWS_PROFILE ||
  process.env.AWS_EXECUTION_ENV || // Set inside AWS Lambda runtime
  process.env.DYNAMODB_ENDPOINT
);

let docClient: DynamoDBDocumentClient | null = null;

if (isAwsConfigured) {
  try {
    const client = new DynamoDBClient({
      region: REGION,
      ...(process.env.DYNAMODB_ENDPOINT ? { endpoint: process.env.DYNAMODB_ENDPOINT } : {}),
    });

    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  } catch (err) {
    console.warn('[DynamoDB] AWS client initialization skipped, defaulting to in-memory mode:', err);
  }
}

export { docClient, isAwsConfigured };
