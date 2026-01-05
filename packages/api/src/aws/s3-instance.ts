import { S3Client } from '@aws-sdk/client-s3';
import { awsCredentialsProvider } from '@vercel/functions/oidc';

import { config } from '@/api/config';

export const s3 = new S3Client({
  region: config.storage.awsRegion,
  endpoint: config.storage.awsEndpoint,
  credentials: process.env.AWS_ROLE_ARN
    ? awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN })
    : undefined,
});
