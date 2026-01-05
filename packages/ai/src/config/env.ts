import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string(),
    OPENAI_DEFAULT_MODEL: z.string().default('gpt-4o-mini'),
  },
  runtimeEnv: process.env,
});

export const config = {
  openAi: {
    apiKey: env.OPENAI_API_KEY,
    defaultModel: env.OPENAI_DEFAULT_MODEL,
  },
};
