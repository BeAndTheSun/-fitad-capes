import 'dotenv/config';

import type { Config } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;
if (dbUrl == null || dbUrl === '') {
  throw new Error("environment variable 'DATABASE_URL' is missing");
}

export default {
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
  verbose: false,
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },
} satisfies Config;
