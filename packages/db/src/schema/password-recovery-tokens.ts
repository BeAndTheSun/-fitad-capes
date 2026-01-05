import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields } from './base';
import { users } from './users';

export const passwordRecoveryTokens = pgTable('password_recovery_tokens', {
  ...baseFields,

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp().notNull(),
  token: varchar({ length: 256 }).notNull(),
  used: boolean().notNull().default(false),
});

export type DbPasswordRecoveryToken =
  typeof passwordRecoveryTokens.$inferSelect;
export type DbPasswordRecoveryTokenExtended = InferResultType<
  'passwordRecoveryTokens',
  {
    user: true;
  }
>;
export type DbNewPasswordRecoveryToken =
  typeof passwordRecoveryTokens.$inferInsert;
export type DbPasswordRecoveryTokenSorting =
  TableSorting<DbPasswordRecoveryToken>;
