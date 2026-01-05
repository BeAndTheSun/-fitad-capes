import type { DrizzleConfig, ExtractTablesWithRelations } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle as pgDrizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { config } from '@/db/config';
import * as schema from '@/db/schema';

type Client = PostgresJsDatabase<typeof schema>;

export class DbClient {
  private static client: Client | null;

  private static createClient(): Client {
    const drizzleConfig: DrizzleConfig<typeof schema> = {
      schema,
      logger: config.node.env === 'development' ? config.db.logging : false,
    };

    if (config.db.url == null) {
      throw new Error("environment variable 'DATABASE_URL' is missing");
    }

    // TODO: this probably needs a better checking
    let { url } = config.db;
    if (config.node.env !== 'development' && !url.includes('sslmode')) {
      url = `${url}?sslmode=require`;
    }
    const client = postgres(url, {
      max: 10,
      idle_timeout: 30, // close idle connections after 30 seconds, to prevent idle connections from staying open indefinitely
    });

    return pgDrizzle(client, drizzleConfig);
  }

  public static getClient(): Client {
    if (this.client == null) {
      this.client = this.createClient();
    }

    return this.client;
  }

  public static getTableSchemas():
    | ExtractTablesWithRelations<typeof schema>
    | undefined {
    const client = this.getClient();
    const tablesSchema = client._.schema;

    return tablesSchema;
  }
}
