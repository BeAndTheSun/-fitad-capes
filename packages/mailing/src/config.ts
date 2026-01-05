import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: {
    NODE_ENV: z.enum(['production', 'development', 'test']),
    MAILING_USER: z.string().nonempty(),
    MAILING_PASSWORD: z.string().nonempty(),
    MAILING_DEFAULT_FROM: z.string().email(),
  },
  client: {},
  runtimeEnv: process.env,
});

export const config = {
  node: {
    env: env.NODE_ENV,
  },
  mailing: {
    user: env.MAILING_USER,
    password: env.MAILING_PASSWORD,
    defaultFrom: env.MAILING_DEFAULT_FROM,
  },
};
