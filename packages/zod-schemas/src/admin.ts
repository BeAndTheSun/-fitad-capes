import { z } from 'zod';

import { insertChatSchema, selectChatSchema } from './chat';
import {
  insertFeatureFlagsSchema,
  selectFeatureFlagsSchema,
} from './feature-flag';
import {
  insertGlobalFeatureFlagsSchema,
  selectGlobalFeatureFlagsSchema,
} from './global-feature-flags';
import {
  insertIntegrationKeySchema,
  selectIntegrationKeySchema,
} from './integration-key';
import {
  insertIntegrationSchema,
  selectIntegrationSchema,
} from './integrations';
import { insertMemberInvitationSchema } from './member-invitations';
import { insertMessageSchema, selectMessageSchema } from './message';
import {
  insertPasswordRecoveryTokenSchema,
  selectPasswordRecoveryTokenSchema,
} from './password-recovery-tokens';
import { insertReportsSchema, selectReportsSchema } from './reports';
import {
  insertTablesHistorySchema,
  selectTablesHistorySchema,
} from './tables-history';
import {
  insertUserFeatureFlagsSchema,
  selectUserFeatureFlagsSchema,
} from './user-feature-flags';
import {
  insertUserPersonalDataSchema,
  selectUserPersonalDataSchema,
} from './user-personal-data';
import {
  insertUserWorkspacesSchema,
  selectUserWorkspacesSchema,
} from './user-workspaces';
import { insertUserSchema, selectUserSchemaWithPassword } from './users';
import { insertVenueSchema, selectVenueSchema } from './venue';
import { insertVenueUsersSchema, selectVenueUsersSchema } from './venue-users';
import {
  insertWebhookEventsSchema,
  selectWebhookEventsSchema,
} from './webhook-events';
import { insertWebhooksSchema, selectWebhooksSchema } from './webhooks';
import { insertWorkspaceSchema, selectWorkspaceSchema } from './workspace';
import {
  insertWorkspaceProfileSchema,
  selectWorkspaceProfileSchema,
} from './workspace-profile';

const relationAdminSchema = z.string();

// Schema for workspace objects returned within user data (list view)
const workspaceRelationSchema = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  role: z.string(),
  workspace: z.object({
    id: z.string().uuid(),
    createdAt: z.string(),
    name: z.string(),
  }),
});

// Workspaces can be either array of objects (list view) or array of strings (single record view)
const workspacesSchema = z
  .union([z.array(workspaceRelationSchema), z.array(z.string().uuid())])
  .optional()
  .default([]);

export const userAdminModelSchema = selectUserSchemaWithPassword
  .omit({ password: true })
  .extend({
    password: z.string().optional(),
    featureFlags: z.array(z.unknown()).optional(),
    workspaces: workspacesSchema,
  });

export type UserAdminType = z.infer<typeof userAdminModelSchema>;

const workspaceUserSchema = z
  .object({
    userId: z.string(),
    role: z.string(),
    user: z
      .object({
        id: z.string(),
        email: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    id: z.string().optional(),
  })
  .passthrough();

export const workspaceAdminModelSchema = selectWorkspaceSchema.extend({
  users: z
    .array(z.union([relationAdminSchema, workspaceUserSchema]))
    .optional()
    .nullish(),
});

export const venueAdminModelSchema = selectVenueSchema.extend({});

// Define a union schema using a tuple
export const anyModelSchema = z.union([
  userAdminModelSchema,
  selectPasswordRecoveryTokenSchema,
  selectFeatureFlagsSchema,
  selectUserFeatureFlagsSchema,
  workspaceAdminModelSchema,
  selectUserWorkspacesSchema,
  selectTablesHistorySchema,
  selectGlobalFeatureFlagsSchema,
  venueAdminModelSchema,
  selectVenueUsersSchema,
  selectUserPersonalDataSchema,
]);

type UnionKeys<T> = T extends T ? keyof T : never;

export type AnyModelType = z.infer<typeof anyModelSchema>;

export type AnyModelKey = UnionKeys<AnyModelType>;

export const modelSchemas = {
  users: userAdminModelSchema,
  integration: selectIntegrationSchema,
  integrationKey: selectIntegrationKeySchema,
  userFeatureFlags: selectUserFeatureFlagsSchema,
  passwordRecoveryTokens: selectPasswordRecoveryTokenSchema,
  featureFlag: selectFeatureFlagsSchema,
  workspace: workspaceAdminModelSchema,
  userWorkspaces: selectUserWorkspacesSchema,
  workspaceProfile: selectWorkspaceProfileSchema,
  webhooks: selectWebhooksSchema,
  webhookEvents: selectWebhookEventsSchema,
  message: selectMessageSchema,
  chat: selectChatSchema,
  tablesHistory: selectTablesHistorySchema,
  globalFeatureFlags: selectGlobalFeatureFlagsSchema,
  reports: selectReportsSchema,
  venue: venueAdminModelSchema,
  venueUsers: selectVenueUsersSchema,
  userPersonalData: selectUserPersonalDataSchema,
} as const;

export const insertModelSchemas = {
  users: insertUserSchema,
  integration: insertIntegrationSchema,
  integrationKey: insertIntegrationKeySchema,
  userFeatureFlag: insertUserFeatureFlagsSchema,
  passwordRecoveryToken: insertPasswordRecoveryTokenSchema,
  featureFlag: insertFeatureFlagsSchema,
  workspace: insertWorkspaceSchema,
  userWorkspaces: insertUserWorkspacesSchema,
  memberInvitations: insertMemberInvitationSchema,
  workspaceProfile: insertWorkspaceProfileSchema,
  webhooks: insertWebhooksSchema,
  webhookEvents: insertWebhookEventsSchema,
  message: insertMessageSchema,
  chat: insertChatSchema,
  tablesHistory: insertTablesHistorySchema,
  globalFeatureFlags: insertGlobalFeatureFlagsSchema,
  reports: insertReportsSchema,
  venue: insertVenueSchema,
  venueUsers: insertVenueUsersSchema,
  userPersonalData: insertUserPersonalDataSchema,
};

export type ModelName = keyof typeof modelSchemas;

export type ModelSchemas = typeof modelSchemas;

// Function to get schema based on model name
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getModelSchema = (modelName: string) => {
  if (modelName in modelSchemas) {
    return modelSchemas[modelName as keyof typeof modelSchemas];
  }
  // Return a default schema;
  return z.unknown();
};

export { getModelSchema };
