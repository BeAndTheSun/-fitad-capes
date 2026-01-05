import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertGlobalFeatureFlagsSchema,
  select: selectGlobalFeatureFlagsSchema,
  sorting: sortingGlobalFeatureFlagsSchema,
} = createSchemasForTable(schema.globalFeatureFlags);
