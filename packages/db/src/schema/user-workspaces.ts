import { UserRoleEnum } from '@meltstudio/types';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { roleEnum, users } from './users';
import { workspace } from './workspace';

export const userWorkspaces = pgTable(
  'user_workspaces',
  {
    userId: uuid()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    workspaceId: uuid()
      .references(() => workspace.id, { onDelete: 'cascade' })
      .notNull(),
    role: roleEnum().notNull().default(UserRoleEnum.MEMBER),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
  })
);

export type DbUserWorkspaces = typeof userWorkspaces.$inferSelect;
export type DbUserWorkspaceExtended = InferResultType<
  'userWorkspaces',
  {
    user: true;
    workspace: true;
  }
>;

export type DbNewUserWorkspaces = typeof userWorkspaces.$inferInsert;
export type DbUserWorkspacesSorting = TableSorting<DbUserWorkspaces>;
