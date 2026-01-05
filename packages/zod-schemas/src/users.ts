import { createSchemasForTable, dbSchemas } from '@meltstudio/db';
import { z } from 'zod';

import { selectUserFeatureFlagsSchema } from './user-feature-flags';
import { selectUserWorkspacesSchema } from './user-workspaces';
import { selectWorkspaceSchema } from './workspace';

export const {
  insert: insertUserSchema,
  select: selectUserSchemaWithPassword,
  sorting: sortingUserSchema,
} = createSchemasForTable(dbSchemas.users, {
  insert: {
    id: (s) => s.uuid(),
    email: (s) => s.email(),
  },
  select: {
    id: (s) => s.uuid(),
    email: (s) => s.email(),
    secret2fa: (s) => s.nullish(),
    profileImage: (s) => s.nullable(),
  },
});

const userWorkspaces = z
  .object({
    workspace: selectWorkspaceSchema,
  })
  .merge(selectUserWorkspacesSchema);

export const selectUserSchema = selectUserSchemaWithPassword.omit({
  password: true,
  secret2fa: true,
});

const featureFlags = z.object({
  featureFlags: z.array(selectUserFeatureFlagsSchema),
});

const workspaces = z.object({
  workspaces: z.array(userWorkspaces),
});

const workspacesWithRole = z.object({
  workspaces: z.array(selectUserWorkspacesSchema),
});

export const selectUserSchemaWithPasswordExtendedSchema =
  selectUserSchemaWithPassword.merge(featureFlags).merge(workspaces);

export const selectUserSchemaWithRole =
  selectUserSchema.merge(workspacesWithRole);
