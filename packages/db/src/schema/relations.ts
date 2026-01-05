import { relations } from 'drizzle-orm';

import { chat } from './chats';
import { featureFlag } from './feature-flag';
import { globalFeatureFlags } from './global-feature-flags';
import { integration } from './integration';
import { integrationKey } from './integration-key';
import { memberInvitations } from './member-invitations';
import { message } from './messages';
import { passwordRecoveryTokens } from './password-recovery-tokens';
import { reports } from './reports';
import { tablesHistory } from './tables-history';
import { userFeatureFlags } from './user-feature-flags';
import { userWorkspaces } from './user-workspaces';
import { users } from './users';
import { webhookEvents } from './webhook-events';
import { webhooks } from './webhooks';
import { workspace } from './workspace';
import { workspaceProfile } from './workspace-profile';

export const passwordRecoveryTokensRelations = relations(
  passwordRecoveryTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordRecoveryTokens.userId],
      references: [users.id],
    }),
  })
);

export const usersRelations = relations(users, ({ many, one }) => ({
  passwordRecoveryTokens: many(passwordRecoveryTokens),
  featureFlags: many(userFeatureFlags),
  workspaces: many(userWorkspaces),
  inviteToken: one(memberInvitations, {
    fields: [users.id],
    references: [memberInvitations.userId],
  }),
  chats: many(chat),
  messages: many(message),
  history: many(tablesHistory),
}));

export const integrationsRelations = relations(integration, ({ many }) => ({
  integrationKeys: many(integrationKey),
}));

export const integrationsKeysRelations = relations(
  integrationKey,
  ({ one }) => ({
    integration: one(integration, {
      fields: [integrationKey.integrationId],
      references: [integration.id],
    }),
  })
);

export const workspaceRelations = relations(workspace, ({ many, one }) => ({
  users: many(userWorkspaces),
  profile: one(workspaceProfile, {
    fields: [workspace.id],
    references: [workspaceProfile.workspaceId],
  }),
  history: many(tablesHistory),
  webhooks: many(webhooks),
  webhookEvents: many(webhookEvents),
}));

export const userWorkspacesRelations = relations(userWorkspaces, ({ one }) => ({
  user: one(users, {
    fields: [userWorkspaces.userId],
    references: [users.id],
  }),
  workspace: one(workspace, {
    fields: [userWorkspaces.workspaceId],
    references: [workspace.id],
  }),
}));

export const featureFlagRelations = relations(featureFlag, ({ many, one }) => ({
  users: many(userFeatureFlags),
  workspace: one(workspace, {
    fields: [featureFlag.workspaceId],
    references: [workspace.id],
  }),
  globalFeatureFlag: one(globalFeatureFlags, {
    fields: [featureFlag.globalFeatureFlagId],
    references: [globalFeatureFlags.id],
  }),
}));

export const globalFeatureFlagsRelations = relations(
  globalFeatureFlags,
  ({ many }) => ({
    featureFlags: many(featureFlag),
  })
);

export const userFeatureFlagsRelations = relations(
  userFeatureFlags,
  ({ one }) => ({
    featureFlag: one(featureFlag, {
      fields: [userFeatureFlags.featureFlagId],
      references: [featureFlag.id],
    }),
    user: one(users, {
      fields: [userFeatureFlags.userId],
      references: [users.id],
    }),
  })
);

export const memberInvitationsRelations = relations(
  memberInvitations,
  ({ one }) => ({
    user: one(users, {
      fields: [memberInvitations.userId],
      references: [users.id],
    }),
    workspace: one(workspace, {
      fields: [memberInvitations.workspaceId],
      references: [workspace.id],
    }),
  })
);

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [webhooks.workspaceId],
    references: [workspace.id],
  }),
  webhookEvents: many(webhookEvents),
}));

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  workspace: one(workspace, {
    fields: [webhookEvents.workspaceId],
    references: [workspace.id],
  }),
  webhook: one(webhooks, {
    fields: [webhookEvents.webhookId],
    references: [webhooks.id],
  }),
}));

export const chatRelations = relations(chat, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [chat.workspaceId],
    references: [workspace.id],
  }),
  messages: many(message),
  user: one(users, {
    fields: [chat.userId],
    references: [users.id],
  }),
}));
export const messageRelations = relations(message, ({ one }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
  user: one(users, {
    fields: [message.userId],
    references: [users.id],
  }),
}));

export const tableHistoryRelations = relations(tablesHistory, ({ one }) => ({
  user: one(users, {
    fields: [tablesHistory.userId],
    references: [users.id],
  }),
  workspace: one(workspace, {
    fields: [tablesHistory.workspaceId],
    references: [workspace.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  workspace: one(workspace, {
    fields: [reports.workspaceId],
    references: [workspace.id],
  }),
}));
