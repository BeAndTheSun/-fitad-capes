import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: {
    SERVER_PORT: z.number().optional(),
  },
  client: {},
  runtimeEnv: process.env,
});

export const config = {
  app: {
    port: env.SERVER_PORT,
  },
};
