import type { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest
      .fn()
      .mockImplementation((config: DynamoDBClientConfig) => ({
        config,
      })),
  };
});

describe('DynamoDB Client Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should create a DynamoDB client', async () => {
    const { dynamoDbClient } = await import('@/tasks/dynamo');
    expect(dynamoDbClient).toBeDefined();
  });
});
