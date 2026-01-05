import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertIntegrationKeySchema,
  select: selectIntegrationKeySchema,
  sorting: sortingIntegrationKeySchema,
} = createSchemasForTable(dbSchemas.integrationKey, {
  insert: {
    id: (s) => s.uuid(),
  },
  select: {
    id: (s) => s.uuid(),
  },
});
