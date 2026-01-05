import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertFeatureFlagsSchema,
  select: selectFeatureFlagsSchema,
  sorting: sortingFeatureFlagsSchema,
} = createSchemasForTable(schema.featureFlag);
