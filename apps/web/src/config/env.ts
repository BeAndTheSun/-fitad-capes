import { TwoFactorProvider } from '@meltstudio/types';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { StorageProvider } from '@/api/enums';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['production', 'development', 'test']),
    VERCEL_URL: z.string().nonempty().optional(),
    BASE_URL: z.string().nonempty().optional(),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z.enum(['production', 'development', 'test']),
    NEXT_PUBLIC_TWO_FACTOR_AUTH_PROVIDER: z.nativeEnum(TwoFactorProvider),
    NEXT_PUBLIC_FILE_STORAGE_PROVIDER: z.nativeEnum(StorageProvider),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_TWO_FACTOR_AUTH_PROVIDER:
      process.env.NEXT_PUBLIC_TWO_FACTOR_AUTH_PROVIDER,
    NEXT_PUBLIC_FILE_STORAGE_PROVIDER:
      process.env.NEXT_PUBLIC_FILE_STORAGE_PROVIDER,
  },
});
