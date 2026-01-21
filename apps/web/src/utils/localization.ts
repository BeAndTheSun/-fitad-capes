import {
  ActivityActions,
  ReportStatusEnum,
  TableNames,
  UserRoleEnum,
} from '@meltstudio/types';
import type { TFunction } from 'next-i18next';

import { FeatureFlag } from '@/feature-flags/index';

export function getUserRoleName(t: TFunction, role: UserRoleEnum): string {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return t('Trainer');
    case UserRoleEnum.MEMBER:
      return t('Super Participant');
    case UserRoleEnum.SUPER_ADMIN:
      return t('Super Admin');
    default:
      return t('Role does not exist');
  }
}

export function getLocalizedFeatureFlagName(
  t: TFunction,
  flag: FeatureFlag
): string {
  switch (flag) {
    case FeatureFlag.EXAMPLE_FEATURE:
      return t('Example Feature');
    case FeatureFlag.TWO_FACTOR_AUTH:
      return t('Two Factor Authentication');
    case FeatureFlag.REPORTS_MODULE:
      return t('Reports Module');
    case FeatureFlag.HISTORY_MODULE:
      return t('History Module');
    case FeatureFlag.CHATS_MODULE:
      return t('Chats Module');
    case FeatureFlag.MEMBERS_MANAGEMENT:
      return t('Members Management');
    case FeatureFlag.WEBHOOKS_MODULE:
      return t('Webhooks Module');
    case FeatureFlag.INTEGRATIONS_MODULE:
      return t('Integrations Module');
    default:
      return t('Feature flag does not exist');
  }
}

export function getLocalizedFeatureFlagDescription(
  t: TFunction,
  flag: FeatureFlag
): string {
  switch (flag) {
    case FeatureFlag.TWO_FACTOR_AUTH:
      return t(
        'Security module that allows enabling two-factor authentication (2FA) during login.'
      );
    case FeatureFlag.REPORTS_MODULE:
      return t('Module for generating reports.');
    case FeatureFlag.HISTORY_MODULE:
      return t(
        'Module that displays a chronological history of user actions, updates, and system events.'
      );
    case FeatureFlag.CHATS_MODULE:
      return t(
        'Interactive chat module that allows users to ask questions about the workspace and receive automated or real-time assistance through AI.'
      );
    case FeatureFlag.MEMBERS_MANAGEMENT:
      return t(
        'Module for managing workspace members, including member information and role assignment.'
      );
    case FeatureFlag.WEBHOOKS_MODULE:
      return t(
        'Module for configuring webhooks to send selected application events to external services.'
      );
    case FeatureFlag.INTEGRATIONS_MODULE:
      return t(
        'Module that enables integration of the workspace with third-party platforms.'
      );
    default:
      return t('Feature flag description not available');
  }
}

export function getLocalizedReportStatusName(
  t: TFunction,
  status: ReportStatusEnum
): string {
  switch (status) {
    case ReportStatusEnum.PENDING:
      return t('Pending');
    case ReportStatusEnum.DONE:
      return t('Done');
    default:
      return t('Status does not exist');
  }
}

export function getLocalizedTableName(t: TFunction, table: TableNames): string {
  switch (table) {
    case TableNames.FEATURE_FLAGS:
      return t('Feature Flags');
    case TableNames.MEMBER_INVITATIONS:
      return t('Member Invitations');
    case TableNames.PASSWORD_RECOVERY_TOKENS:
      return t('Password Recovery Tokens');
    case TableNames.USER_FEATURE_FLAGS:
      return t('User Feature Flags');
    case TableNames.USER_WORKSPACES:
      return t('User Workspaces');
    case TableNames.USERS:
      return t('Users');
    case TableNames.WORKSPACES:
      return t('Workspaces');
    case TableNames.WORKSPACE_PROFILE:
      return t('Workspace Profiles');
    default:
      return t('Unknown Table');
  }
}

export function getLocalizedActivityActionName(
  t: TFunction,
  action: ActivityActions
): string {
  switch (action) {
    case ActivityActions.CREATE:
      return t('Create');
    case ActivityActions.UPDATE:
      return t('Update');
    case ActivityActions.DELETE:
      return t('Delete');
    case ActivityActions.ENABLE:
      return t('Enable');
    case ActivityActions.DISABLE:
      return t('Disable');
    case ActivityActions.INVITE:
      return t('Invite');
    default:
      return t('Action does not exist');
  }
}

export function getLocalizedReportTableName(
  t: TFunction,
  table: string
): string {
  switch (table) {
    case 'users':
      return t('Users');
    case 'tables_history':
      return t('History');
    case 'webhooks':
      return t('Webhooks');
    case 'venue':
      return t('Venues');
    default:
      return t('Unknown Report Table');
  }
}
