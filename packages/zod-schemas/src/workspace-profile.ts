import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertWorkspaceProfileSchema,
  select: selectWorkspaceProfileSchema,
  sorting: sortingWorkspaceProfileSchema,
} = createSchemasForTable(dbSchemas.workspaceProfile);
