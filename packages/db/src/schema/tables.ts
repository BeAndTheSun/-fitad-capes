import { chat } from './chats';
import { embeddings } from './embeddings';
import { featureFlag } from './feature-flag';
import { globalFeatureFlags } from './global-feature-flags';
import { integration } from './integration';
import { integrationKey } from './integration-key';
import { memberInvitations } from './member-invitations';
import { message } from './messages';
import { passwordRecoveryTokens } from './password-recovery-tokens';
import { personalInfo } from './personal-info';
import { reports } from './reports';
import { tablesHistory } from './tables-history';
import { userFeatureFlags } from './user-feature-flags';
import { userWorkspaces } from './user-workspaces';
import { users } from './users';
import { venue } from './venue';
import { venueUsers } from './venue-users';
import { webhookEvents } from './webhook-events';
import { webhooks } from './webhooks';
import { workspace } from './workspace';
import { workspaceProfile } from './workspace-profile';

export const dbSchemas = {
  embeddings,
  featureFlag,
  integration,
  integrationKey,
  memberInvitations,
  passwordRecoveryTokens,
  userFeatureFlags,
  userWorkspaces,
  users,
  venue,
  workspace,
  workspaceProfile,
  webhooks,
  webhookEvents,
  message,
  chat,
  tablesHistory,
  globalFeatureFlags,
  reports,
  venueUsers,
  personalInfo,
};
