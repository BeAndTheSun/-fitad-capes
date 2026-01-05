import type { DbClientType } from '@meltstudio/db/src/utils';
import { sql } from 'drizzle-orm';

import type { TableRow } from './types';
import { BATCH_SIZE } from './types';

// Function to fetch a batch of data from a specific table
export async function fetchBatchDataFromDb(
  db: DbClientType,
  tableName: string,
  offset: number
): Promise<TableRow[]> {
  const result = await db.execute<TableRow>(
    sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT ${BATCH_SIZE} OFFSET ${offset}`
  );
  return result;
}
