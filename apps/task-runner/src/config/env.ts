import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const usingVercel = process.env.FILE_STORAGE_PROVIDER === 'vercel';

const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    FILE_STORAGE_PROVIDER: z.string().min(1),

    // AWS
    AWS_ENDPOINT: z.string().optional(),
    ASW_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().min(1),

    AWS_DYNAMO_DB_TABLE_NAME: z.string().min(1),
    AWS_FILES_BUCKET_NAME: z.string().min(1),
    ...(usingVercel ? { BLOB_READ_WRITE_TOKEN: z.string().min(1) } : {}),

    SENTRY_DSN: z.string().optional().default(''),
  },
  runtimeEnv: process.env,
});

export const config = {
  aws: {
    region: env.AWS_REGION,
    endpoint: env.AWS_ENDPOINT,
    accessKeyId: env.ASW_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  vercel: {
    blobReadWriteToken: env.BLOB_READ_WRITE_TOKEN,
  },
  storage: {
    provider: env.FILE_STORAGE_PROVIDER,
    s3: {
      bucketName: env.AWS_FILES_BUCKET_NAME,
    },

    dynamo: {
      tableName: env.AWS_DYNAMO_DB_TABLE_NAME,
    },
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
};

export type Config = typeof config;
