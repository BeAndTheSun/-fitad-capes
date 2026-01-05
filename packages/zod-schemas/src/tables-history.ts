import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertTablesHistorySchema,
  select: selectTablesHistorySchema,
  sorting: sortingTablesHistorySchema,
} = createSchemasForTable(schema.tablesHistory);
