import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { StorageProvider } from './enums';

// IMPORTANT: add to packages\api\jest.setup.js any variable added here, otherwise tests will fail

const commonSchema = {
  NODE_ENV: z.enum(['production', 'development', 'test']),
  FILE_STORAGE_PROVIDER: z.nativeEnum(StorageProvider),
  AWS_DYNAMO_DB_TABLE_NAME: z.string().min(1),
  AWS_REGION: z.string().min(1),
};

const awsSchema = {
  AWS_ENDPOINT: z.string().url(),
  BUCKET_NAME: z.string().min(1),
};

const vercelSchema = {
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
};

const usingAWS = process.env.FILE_STORAGE_PROVIDER === StorageProvider.AWS;
const usingVercel =
  process.env.FILE_STORAGE_PROVIDER === StorageProvider.VERCEL;

const envSchema = {
  ...commonSchema,
  ...(usingAWS ? awsSchema : {}),
  ...(usingVercel ? vercelSchema : {}),
};

const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: envSchema,
  client: {},
  runtimeEnv: process.env,
});

export const config = {
  node: {
    env: env.NODE_ENV,
  },
  storage: {
    awsRegion: env.AWS_REGION,
    awsEndpoint: env.AWS_ENDPOINT,
    bucketName: env.BUCKET_NAME,
    ddbTableName: env.AWS_DYNAMO_DB_TABLE_NAME,
    provider: env.FILE_STORAGE_PROVIDER,
    vercelBlobReadWriteToken: env.BLOB_READ_WRITE_TOKEN,
    vercelBlobUrl: env.BLOB_READ_WRITE_TOKEN
      ? `https://${env.BLOB_READ_WRITE_TOKEN.split('_')[3]}.public.blob.vercel-storage.com/`
      : '',
  },
};
