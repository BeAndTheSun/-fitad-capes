import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertReportsSchema,
  select: selectReportsSchema,
  sorting: sortingReportsSchema,
} = createSchemasForTable(dbSchemas.reports);
