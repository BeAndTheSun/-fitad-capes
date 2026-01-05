import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertChatSchema,
  select: selectChatSchema,
  sorting: sortingChatSchema,
} = createSchemasForTable(dbSchemas.chat);
