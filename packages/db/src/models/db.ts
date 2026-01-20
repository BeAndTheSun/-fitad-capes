import { globalFeatureFlagsAlgolia } from '@/db/algolia/model/global-feature-flags';
import { algoliaReports } from '@/db/algolia/model/reports';
import { algoliaTablesHistory } from '@/db/algolia/model/tables-history';
import { user } from '@/db/algolia/model/user';
import { workspaces } from '@/db/algolia/model/workspace';

import { DbChatModel } from './chat';
import { DBFeatureFlagModel } from './feature-flag';
import { DbGlobalFeatureFlagsModel } from './global-feature-flags';
import { DbIntegrationModel } from './integration';
import { DbIntegrationKeyModel } from './integration-key';
import { DbMemberInviteModel } from './member-invitations';
import { DbMessageModel } from './message';
import { DbPasswordRecoveryTokenModel } from './password-recovery-token';
import { DbReportsModel } from './reports';
import { DbTablesHistoryModel } from './tables-history';
import { DbUserModel } from './user';
import { DBUserFeatureFlags } from './user-feature-flags';
import { DBUserPersonalDataModel } from './user-personal-data';
import { DbUserWorkspacesModel } from './user-workspaces';
import { DbVenueModel } from './venue';
import { DBVenueUserModel } from './venue-users';
import { DbWebhookEventsModel } from './webhook-events';
import { DbWebhooksModel } from './webhooks';
import { DbWorkspaceModel } from './workspace';
import { DbWorkspaceProfileModel } from './workspace-profile';

export type DbModelMap = {
  passwordRecoveryToken: DbPasswordRecoveryTokenModel;
  users: DbUserModel;
  featureFlag: DBFeatureFlagModel;
  userFeatureFlag: DBUserFeatureFlags;
  workspace: DbWorkspaceModel;
  userWorkspaces: DbUserWorkspacesModel;
  memberInvitations: DbMemberInviteModel;
  workspaceProfile: DbWorkspaceProfileModel;
  integration: DbIntegrationModel;
  integrationKey: DbIntegrationKeyModel;
  webhooks: DbWebhooksModel;
  webhookEvents: DbWebhookEventsModel;
  chat: DbChatModel;
  message: DbMessageModel;
  tablesHistory: DbTablesHistoryModel;
  reports: DbReportsModel;
  globalFeatureFlags: DbGlobalFeatureFlagsModel;
  venue: DbVenueModel;
  venueUsers: DBVenueUserModel;
  userPersonalData: DBUserPersonalDataModel;
  // Add other models here
};

export const DbModelMapValues = {
  passwordRecoveryToken: true,
  users: true,
  featureFlag: true,
  userFeatureFlag: true,
  workspace: true,
  userWorkspaces: true,
  venueUsers: true,
  memberInvitations: true,
  workspaceProfile: true,
  integration: true,
  integrationKey: true,
  webhooks: true,
  webhookEvents: true,
  globalFeatureFlags: true,
  venue: true,
  userPersonalData: true,
} as const;

export type DbModelKeys = keyof DbModelMap;
export const dbModelKeys = Object.keys(DbModelMapValues) as DbModelKeys[];
export type DbModelRecord = DbModelMap[DbModelKeys];

export class Db {
  public models: { [K in keyof DbModelMap]: DbModelMap[K] };

  public constructor() {
    this.models = {
      passwordRecoveryToken: new DbPasswordRecoveryTokenModel(this),
      users: new DbUserModel(this, user),
      featureFlag: new DBFeatureFlagModel(this),
      userFeatureFlag: new DBUserFeatureFlags(this),
      workspace: new DbWorkspaceModel(this, workspaces),
      userWorkspaces: new DbUserWorkspacesModel(this),
      memberInvitations: new DbMemberInviteModel(this),
      workspaceProfile: new DbWorkspaceProfileModel(this),
      integration: new DbIntegrationModel(this),
      integrationKey: new DbIntegrationKeyModel(this),
      webhookEvents: new DbWebhookEventsModel(this),
      webhooks: new DbWebhooksModel(this),
      chat: new DbChatModel(this),
      message: new DbMessageModel(this),
      venueUsers: new DBVenueUserModel(this),
      tablesHistory: new DbTablesHistoryModel(this, algoliaTablesHistory),
      reports: new DbReportsModel(this, algoliaReports),
      globalFeatureFlags: new DbGlobalFeatureFlagsModel(
        this,
        globalFeatureFlagsAlgolia
      ),
      venue: new DbVenueModel(this),
      userPersonalData: new DBUserPersonalDataModel(this),
    };
  }

  public get user(): DbUserModel {
    return this.models.users;
  }

  public get passwordRecoveryToken(): DbPasswordRecoveryTokenModel {
    return this.models.passwordRecoveryToken;
  }

  public get featureFlag(): DBFeatureFlagModel {
    return this.models.featureFlag;
  }

  public get userFeatureFlag(): DBUserFeatureFlags {
    return this.models.userFeatureFlag;
  }

  public get workspace(): DbWorkspaceModel {
    return this.models.workspace;
  }

  public get venueUsers(): DBVenueUserModel {
    return this.models.venueUsers;
  }

  public get userWorkspaces(): DbUserWorkspacesModel {
    return this.models.userWorkspaces;
  }

  public get memberInvitations(): DbMemberInviteModel {
    return this.models.memberInvitations;
  }

  public get workspaceProfile(): DbWorkspaceProfileModel {
    return this.models.workspaceProfile;
  }

  public get webhooks(): DbWebhooksModel {
    return this.models.webhooks;
  }

  public get integration(): DbIntegrationModel {
    return this.models.integration;
  }

  public get integrationKey(): DbIntegrationKeyModel {
    return this.models.integrationKey;
  }

  public get message(): DbMessageModel {
    return this.models.message;
  }

  public get chat(): DbChatModel {
    return this.models.chat;
  }

  public get webhookEvents(): DbWebhookEventsModel {
    return this.models.webhookEvents;
  }

  public get tablesHistory(): DbTablesHistoryModel {
    return this.models.tablesHistory;
  }

  public get globalFeatureFlags(): DbGlobalFeatureFlagsModel {
    return this.models.globalFeatureFlags;
  }

  public get reports(): DbReportsModel {
    return this.models.reports;
  }

  public get venue(): DbVenueModel {
    return this.models.venue;
  }

  public get userPersonalData(): DBUserPersonalDataModel {
    return this.models.userPersonalData;
  }

  public getModel<K extends keyof DbModelMap>(modelName: K): DbModelMap[K] {
    return this.models[modelName];
  }
}
