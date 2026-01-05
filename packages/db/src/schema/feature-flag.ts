import {
  boolean,
  pgTable,
  text,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields } from './base';
import { globalFeatureFlags } from './global-feature-flags';
import { workspace } from './workspace';

export const featureFlag = pgTable(
  'feature_flag',
  {
    ...baseFields,
    flag: varchar({ length: 64 }).notNull(),
    description: text().notNull().default(''),
    released: boolean().notNull().default(false),
    workspaceId: uuid()
      .notNull()
      .references(() => workspace.id, {
        onDelete: 'cascade',
      }),
    globalFeatureFlagId: uuid()
      .notNull()
      .references(() => globalFeatureFlags.id, {
        onDelete: 'cascade',
      }),
  },
  (t) => [unique().on(t.workspaceId, t.globalFeatureFlagId)]
);

export type DbFeatureFlag = typeof featureFlag.$inferSelect;
export type DbFeatureFlagExtended = InferResultType<
  'featureFlag',
  {
    users: true;
    workspace: true;
    globalFeatureFlag: true;
  }
>;
export type DbNewFeatureFlag = typeof featureFlag.$inferInsert;
export type DbFeatureFlagSorting = TableSorting<DbFeatureFlag>;
