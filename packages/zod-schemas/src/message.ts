import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertMessageSchema,
  select: selectMessageSchema,
  sorting: sortingMessageSchema,
} = createSchemasForTable(dbSchemas.message);
