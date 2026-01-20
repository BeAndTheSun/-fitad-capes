/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';

import type {
  DBFeatureFlagModel,
  DbGlobalFeatureFlagsModel,
  DbGlobalFeatureFlagsWhere,
  DbIntegrationKeyModel,
  DbIntegrationKeyWhere,
  DbIntegrationModel,
  DbIntegrationWhere,
  DbMemberInvitationWhere,
  DbMemberInviteModel,
  DbReportsModel,
  DBUserFeatureFlags,
  DbUserModel,
  DBUserPersonalDataModel,
  DBUserPersonalDataWhere,
  DbUserWorkspacesModel,
  DbUserWorkspacesWhere,
  DbVenueModel,
  DbVenueWhere,
  DbWorkspaceModel,
  DbWorkspaceWhere,
  FeatureFlagsWhere,
  ReportsDbWhere,
  TablesHistoryDbWhere,
  UserDbWhere,
} from '@/db/models';
import type { DbModel, DbWhere } from '@/db/models/base';
import type { ChatWhere } from '@/db/models/chat';
import type { MessageWhere } from '@/db/models/message';
import type {
  DbPasswordRecoveryTokenModel,
  DbPasswordRecoveryTokenWhere,
} from '@/db/models/password-recovery-token';
import type {
  DBVenueUserModel,
  DBVenueUserWhere,
} from '@/db/models/venue-users';
import type { DbWebhookEventsWhere } from '@/db/models/webhook-events';
import type { DbWebhooksWhere } from '@/db/models/webhooks';
import type {
  DbWorkspaceProfileModel,
  DbWorkspacesProfileWhere,
} from '@/db/models/workspace-profile';
import type {
  chat,
  DbChat,
  DbMessage,
  DbTablesHistory,
  DbWebhooks,
  featureFlag as featureFlagTable,
  globalFeatureFlags,
  integration as integrationTable,
  integrationKey as integrationKeyTable,
  message,
  passwordRecoveryTokens as passwordRecoveryTokensTable,
  personalInfo as userPersonalDataTable,
  reports,
  tablesHistory as tablesHistoryTable,
  userFeatureFlags as userFeatureFlagsTable,
  users as usersTable,
  userWorkspaces as userWorkspacesTable,
  venue as venueTable,
  venueUsers as venueUsersTable,
  webhookEvents as webhookEventsTable,
  webhooks as webhooksTable,
  workspace as workspacesTable,
  workspaceProfile as workspaceProfileTable,
} from '@/db/schema';
import type { memberInvitations } from '@/db/schema/member-invitations';
import type { SchemaAccessibleName } from '@/db/utils';

import type { MockedClassInstance, MockedDb } from './types';

function buildDbMainModelMock<
  Model,
  DbModelTable extends PgTableWithColumns<{
    name: string;
    schema: undefined;
    columns: Record<string, any>;
    dialect: 'pg';
  }> & {
    enableRLS: () => Omit<DbModelTable, 'enableRLS'>;
  },
  DbModelWhere = Model extends DbModel<any, infer Where, any> ? Where : never,
  DbModelTSName extends SchemaAccessibleName = Model extends DbModel<
    any,
    any,
    infer TSName
  >
    ? TSName
    : never,
>(): MockedClassInstance<DbModel<DbModelTable, DbModelWhere, DbModelTSName>> {
  return {
    findManyWithRelations: jest.fn(),
    dbTableName: 'mockedTableName',
    getDynamicManyRelations: jest.fn(),
    getAdminFieldChoiceName: jest.fn(),
    getModelName: jest.fn(),
    create: jest.fn(),
    loadRelationsByAdmin: jest.fn(),
    createByAdmin: jest.fn(),
    createMany: jest.fn(),
    createManyByAdmin: jest.fn(),
    findWithRelationsByPk: jest.fn(),
    findUniqueByPk: jest.fn(),
    // Add other mocked methods or properties as needed
  } as unknown as MockedClassInstance<
    DbModel<DbModelTable, DbModelWhere, DbModelTSName>
  >;
}

const usersModelMock = {
  ...buildDbMainModelMock<DbUserModel, typeof usersTable, UserDbWhere>(),
  findUniqueByID: jest.fn(),
  findUniqueByEmail: jest.fn(),
  findManyByEmail: jest.fn(),
  findUniqueByEmailWithPassword: jest.fn(),
  getUsersOverTime: jest.fn(),
  getUserCount: jest.fn(),
  getUsersPerVenue: jest.fn(),
  getUsersList: jest.fn(),
  getWorkspaceMembers: jest.fn(),
  findManyWithUserWorkspaces: jest.fn(),
  findAllUsers: jest.fn(),
};

const passwordRecoveryTokensModelMock = {
  ...buildDbMainModelMock<
    DbPasswordRecoveryTokenModel,
    typeof passwordRecoveryTokensTable,
    DbPasswordRecoveryTokenWhere
  >(),
  findUniqueByToken: jest.fn(),
};

const featureFlagModelMock = {
  ...buildDbMainModelMock<
    DBFeatureFlagModel,
    typeof featureFlagTable,
    FeatureFlagsWhere
  >(),
  toggle: jest.fn(),
};

const userFeatureFlagsModelMock = {
  ...buildDbMainModelMock<
    DBUserFeatureFlags,
    typeof userFeatureFlagsTable,
    DbWhere
  >(),
  findManyByUserId: jest.fn(),
  findManyByFeatureFlagId: jest.fn(),
  findByUserIdAndFeatureFlagId: jest.fn(),
  deleteByUser: jest.fn(),
  toggle: jest.fn(),
};

const workspacesModelMock = {
  ...buildDbMainModelMock<
    DbWorkspaceModel,
    typeof workspacesTable,
    DbWorkspaceWhere
  >(),
  findAllWorkspaces: jest.fn(),
};

const userPersonalDataModelMock = {
  ...buildDbMainModelMock<
    DBUserPersonalDataModel,
    typeof userPersonalDataTable,
    DBUserPersonalDataWhere
  >(),
  getUserPersonalData: jest.fn(),
};

const userWorkspacesModelMock = {
  ...buildDbMainModelMock<
    DbUserWorkspacesModel,
    typeof userWorkspacesTable,
    DbUserWorkspacesWhere
  >(),
  findByUserIdAndWorkspaceId: jest.fn(),
  findManyByUserIdAndWorkspaceId: jest.fn(),
  findAllUserWorkspaces: jest.fn(),
  updateRoleMultipleUsersInWorkspace: jest.fn(),
  findFirstTrainerByWorkspaceId: jest.fn(),
};

const memberInvitationsModelMock = {
  ...buildDbMainModelMock<
    DbMemberInviteModel,
    typeof memberInvitations,
    DbMemberInvitationWhere
  >(),
  findByEmailAndWorkspace: jest.fn(),
  findByToken: jest.fn(),
};

const workspaceProfileModelMock = {
  ...buildDbMainModelMock<
    DbWorkspaceProfileModel,
    typeof workspaceProfileTable,
    DbWorkspacesProfileWhere
  >(),
  findByWorkspaceId: jest.fn(),
};

const integrationModelMock = {
  ...buildDbMainModelMock<
    DbIntegrationModel,
    typeof integrationTable,
    DbIntegrationWhere
  >(),
  findByWorkspaceId: jest.fn(),
  findByWorkspaceAndPlatformWithKeys: jest.fn(),
  saveIntegrationData: jest.fn(),
  findEnabledZapierIntegration: jest.fn(),
  hasWebhookUrlForPlatform: jest.fn(),
};

const integrationKeyModelMock = {
  ...buildDbMainModelMock<
    DbIntegrationKeyModel,
    typeof integrationKeyTable,
    DbIntegrationKeyWhere
  >(),
  findByIntegrationId: jest.fn(),
  findAllWebhookUrlsOrderedByCreatedAt: jest.fn(),
};

const webhooksModelMock = {
  ...buildDbMainModelMock<DbWebhooks, typeof webhooksTable, DbWebhooksWhere>(),
  findAllOrderedByCreatedAt: jest.fn(),
  findById: jest.fn(),
  findAllWebhooks: jest.fn(),
  findUrlsAndNamesByWorkspaceId: jest.fn(),
  findManyWithWhere: jest.fn(),
};

const webhookEventsModelMock = {
  ...buildDbMainModelMock<
    DbWebhooks,
    typeof webhookEventsTable,
    DbWebhookEventsWhere
  >(),
  findAllOrderedByCreatedAt: jest.fn(),
};

const messageModelMock = {
  ...buildDbMainModelMock<DbMessage, typeof message, MessageWhere>(),
  findMessagesByChat: jest.fn(),
};
const chatModelMock = {
  ...buildDbMainModelMock<DbChat, typeof chat, ChatWhere>(),
  findChatsByWorkspace: jest.fn(),
};

const tablesHistoryMock = {
  ...buildDbMainModelMock<
    DbTablesHistory,
    typeof tablesHistoryTable,
    TablesHistoryDbWhere
  >(),
  findWithUser: jest.fn(),
  findById: jest.fn(),
  findManyWithUserName: jest.fn(),
};

const globalFeatureFlagsModelMock = {
  ...buildDbMainModelMock<
    DbGlobalFeatureFlagsModel,
    typeof globalFeatureFlags,
    DbGlobalFeatureFlagsWhere
  >(),
};

const reportsModelMock = {
  ...buildDbMainModelMock<DbReportsModel, typeof reports, ReportsDbWhere>(),
};

const venueModelMock = {
  ...buildDbMainModelMock<DbVenueModel, typeof venueTable, DbVenueWhere>(),
  findAllVenues: jest.fn(),
  findVenuesByUserId: jest.fn(),
  generateInvitationToken: jest.fn(),
  findByInvitationToken: jest.fn(),
  generateCheckingToken: jest.fn(),
  findByCheckingToken: jest.fn(),
  getVenueCount: jest.fn(),
  getVenuesOverTime: jest.fn(),
  getVenuesList: jest.fn(),
  isOwner: jest.fn(),
  getCountVenuesByOwner: jest.fn(),
  getVenuesByOwner: jest.fn(),
  getVenueById: jest.fn(),
  getVenueByUserId: jest.fn(),
  updateVenueById: jest.fn(),
};

const venueUsersModelMock = {
  ...buildDbMainModelMock<
    DBVenueUserModel,
    typeof venueUsersTable,
    DBVenueUserWhere
  >(),
  getAllByVenueId: jest.fn(),
  deleteById: jest.fn(),
  deleteByUserId: jest.fn(),
  isUserInVenue: jest.fn(),
  findByUserAndVenue: jest.fn(),
  updateStatus: jest.fn(),
  getVenuesParticipantsCount: jest.fn(),
  getParticipantsStatusCounts: jest.fn(),
};

const DBMock = jest.fn<MockedDb, void[]>().mockImplementation(() => ({
  models: {
    users: usersModelMock,
    passwordRecoveryToken: passwordRecoveryTokensModelMock,
    featureFlag: featureFlagModelMock,
    userFeatureFlag: userFeatureFlagsModelMock,
    workspace: workspacesModelMock,
    userWorkspaces: userWorkspacesModelMock,
    memberInvitations: memberInvitationsModelMock,
    workspaceProfile: workspaceProfileModelMock,
    integration: integrationModelMock,
    integrationKey: integrationKeyModelMock,
    webhooks: webhooksModelMock,
    webhookEvents: webhookEventsModelMock,
    message: messageModelMock,
    chat: chatModelMock,
    tablesHistory: tablesHistoryMock,
    globalFeatureFlags: globalFeatureFlagsModelMock,
    reports: reportsModelMock,
    venue: venueModelMock,
    venueUsers: venueUsersModelMock,
    userPersonalData: userPersonalDataModelMock,
  },
  user: usersModelMock,
  passwordRecoveryToken: passwordRecoveryTokensModelMock,
  featureFlag: featureFlagModelMock,
  userFeatureFlag: userFeatureFlagsModelMock,
  workspace: workspacesModelMock,
  userWorkspaces: userWorkspacesModelMock,
  memberInvitations: memberInvitationsModelMock,
  workspaceProfile: workspaceProfileModelMock,
  integration: integrationModelMock,
  integrationKey: integrationKeyModelMock,
  webhooks: webhooksModelMock,
  webhookEvents: webhookEventsModelMock,
  message: messageModelMock,
  chat: chatModelMock,
  tablesHistory: tablesHistoryMock,
  globalFeatureFlags: globalFeatureFlagsModelMock,
  reports: reportsModelMock,
  venue: venueModelMock,
  venueUsers: venueUsersModelMock,
  userPersonalData: userPersonalDataModelMock,
  getModel: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@meltstudio/db', () => ({
  ...jest.requireActual('@meltstudio/db'),
  Db: DBMock,
}));
