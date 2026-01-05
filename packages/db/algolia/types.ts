import type { Db } from '@meltstudio/db';

export type GetTableNamesResponse = {
  table_name: string;
};

export type AlgoliaRecord = {
  objectID: string;
  row: TableRow;
};

export type TableRow = Record<string, unknown>;

export const BATCH_SIZE = 100;

export type DbModelRecord = Db['models'][keyof Db['models']];
