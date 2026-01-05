import { sql } from 'drizzle-orm';
import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const baseFields = {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp({
    mode: 'string',
    withTimezone: true,
  })
    .notNull()
    .default(sql`timezone('UTC', NOW())`),
};

export type SortingOrder = 'asc' | 'desc';
export type TableSorting<T> = {
  column: keyof T;
  order: SortingOrder;
};

// Takes an enum and returns an array with each value as a string
export function enumToPgEnum<T extends Record<string, string | number>>(
  myEnum: T
): [string, ...string[]] {
  return Object.values(myEnum).map((value) => `${value}`) as [
    string,
    ...string[],
  ];
}
