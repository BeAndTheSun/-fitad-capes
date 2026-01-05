import {
  index,
  jsonb,
  pgTable,
  text,
  unique,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

import { baseWorkspaceFields } from './workspace-base';

export const embeddings = pgTable(
  'embeddings',
  {
    ...baseWorkspaceFields,
    tableName: text().notNull(),
    rowId: uuid().notNull(),
    data: jsonb().notNull(),
    embedding: vector({ dimensions: 1536 }).notNull(),
  },
  (table) => [
    index().using('hnsw', table.embedding.op('vector_cosine_ops')),
    unique().on(table.tableName, table.rowId),
  ]
);
