import { UserRoleEnum } from '@meltstudio/types';
import { boolean, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields, enumToPgEnum } from './base';

// Declare drizzle enum
export const roleEnum = pgEnum('role', enumToPgEnum(UserRoleEnum));

export const users = pgTable('users', {
  ...baseFields,

  email: varchar({ length: 256 }).unique().notNull(),
  name: varchar({ length: 256 }).notNull(),
  active: boolean().notNull(),
  password: varchar({ length: 256 }).notNull(),
  is2faEnabled: boolean().notNull().default(false),
  secret2fa: varchar({ length: 256 }),
  profileImage: text(),
  isSuperAdmin: boolean().notNull().default(false),
  gtmId: varchar().default(''),
});

export type DbUserWithPassword = typeof users.$inferSelect;
export type DbUserWithPasswordExtended = InferResultType<
  'users',
  {
    featureFlags: true;
    workspaces: {
      with: { workspace: true };
    };
  }
>;
export type DbUser = Omit<DbUserWithPassword, 'password' | 'secret2fa'>;
export type DbUserExtended = Omit<
  DbUserWithPasswordExtended,
  'password' | 'secret2fa'
>;
export type DbUserWithWorkspaces = Omit<DbUserExtended, 'featureFlags'>;
export type DbNewUser = typeof users.$inferInsert;
export type DbUserSorting = TableSorting<DbUser>;
export type DBUserWithUserWoksapces = InferResultType<
  'users',
  {
    workspaces: true;
  }
>;
export type DbUserWithRole = Omit<
  DBUserWithUserWoksapces,
  'password' | 'secret2fa'
>;
