import { boolean, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { baseFields } from './base';

export const globalFeatureFlags = pgTable('global_feature_flags', {
  ...baseFields,
  flag: varchar({ length: 64 }).notNull().unique(),
  description: text().notNull().default(''),
  released: boolean().notNull().default(false),
  allowWorkspaceControl: boolean().notNull().default(false),
});

export type DbGlobalFeatureFlags = typeof globalFeatureFlags.$inferSelect;
