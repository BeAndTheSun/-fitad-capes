import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { awsCredentialsProvider } from '@vercel/functions/oidc';

export const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ROLE_ARN
    ? awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN })
    : undefined,
});
