import { boolean, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { featureFlag } from './feature-flag';
import { users } from './users';

export const userFeatureFlags = pgTable(
  'user_feature_flags',
  {
    userId: uuid()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    featureFlagId: uuid()
      .references(() => featureFlag.id, { onDelete: 'cascade' })
      .notNull(),
    released: boolean().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.featureFlagId] })]
);

export type DbUserFeatureFlags = typeof userFeatureFlags.$inferSelect;
export type DbUserFeatureFlagsExtended = InferResultType<
  'userFeatureFlags',
  {
    featureFlag: true;
    user: true;
  }
>;
export type DbNewUserFeatureFlags = typeof userFeatureFlags.$inferInsert;
export type DbUserFeatureFlagsSorting = TableSorting<DbUserFeatureFlags>;
