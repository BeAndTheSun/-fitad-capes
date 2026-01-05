import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertUserFeatureFlagsSchema,
  select: selectUserFeatureFlagsSchema,
  sorting: sortingUserFeatureFlagsSchema,
} = createSchemasForTable(schema.userFeatureFlags);
