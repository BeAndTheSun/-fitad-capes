import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { baseFields } from './base';
import { workspace } from './workspace';

export const webhooks = pgTable('webhooks', {
  ...baseFields,
  name: text().notNull(),
  url: text().notNull(),
  workspaceId: uuid()
    .notNull()
    .references(() => workspace.id, {
      onDelete: 'cascade',
    }),
  eventTypes: text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

export type DbWebhooks = typeof webhooks.$inferSelect;
