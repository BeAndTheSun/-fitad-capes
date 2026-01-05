import { pgTable, varchar } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields } from './base';

export const workspace = pgTable('workspace', {
  ...baseFields,
  name: varchar({ length: 256 }).notNull(),
});

export type DbWorkspace = typeof workspace.$inferSelect;
export type DbWorkspaceExtended = InferResultType<'workspace', { users: true }>;
export type DbNewWorkspace = typeof workspace.$inferInsert;
export type DbWorkspacesSorting = TableSorting<DbWorkspace>;
