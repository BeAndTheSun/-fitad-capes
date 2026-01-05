import { ActivityActions } from '@meltstudio/types';
import { json, pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import { baseFields, enumToPgEnum } from './base';
import { users } from './users';
import { workspace } from './workspace';

export const tableActionsEnum = pgEnum(
  'table_actions',
  enumToPgEnum(ActivityActions)
);

export const tablesHistory = pgTable('tables_history', {
  ...baseFields,
  userId: uuid()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  workspaceId: uuid().references(() => workspace.id, {
    onDelete: 'cascade',
  }),
  action: tableActionsEnum().notNull(),
  tableName: varchar().notNull(),
  recordId: uuid(),
  actionDescription: json().notNull(),
});

export type DbTablesHistory = typeof tablesHistory.$inferSelect;
export type DbTablesHistoryExtended = InferResultType<
  'tablesHistory',
  {
    user: true;
    workspace: true;
  }
>;

export type DbNewTablesHistory = typeof tablesHistory.$inferInsert;
export type DbTablesHistorySorting = DbTablesHistory;
