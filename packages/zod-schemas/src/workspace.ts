import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertWorkspaceSchema,
  select: selectWorkspaceSchema,
  sorting: sortingWorkspaceSchema,
} = createSchemasForTable(dbSchemas.workspace);
