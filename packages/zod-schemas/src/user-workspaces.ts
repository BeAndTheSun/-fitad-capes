import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertUserWorkspacesSchema,
  select: selectUserWorkspacesSchema,
  sorting: sortingUserWorkspacesSchema,
} = createSchemasForTable(dbSchemas.userWorkspaces);
