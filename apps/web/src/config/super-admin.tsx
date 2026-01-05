import type { AnyModelKey } from '@meltstudio/zod-schemas';
import {
  selectGlobalFeatureFlagsSchema,
  selectUserWorkspacesSchema,
  userAdminModelSchema,
  workspaceAdminModelSchema,
} from '@meltstudio/zod-schemas';
import {
  ChatBubbleIcon,
  ClipboardIcon,
  GlobeIcon,
  MagicWandIcon,
  StackIcon,
} from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import React from 'react';
import type { z } from 'zod';

import { AlgoliaIndex } from '@/common-types/algolia';
import type {
  FieldDataOption,
  FieldDataSize,
  FieldDataType,
} from '@/ui/form-hook-helper';

export type ModelConfigFieldType =
  | FieldDataType
  | 'ID'
  | 'boolean'
  | 'email'
  | 'relation'
  | 'manyRelation';

export type ModelConfigField = {
  label: ReactNode;
  type: ModelConfigFieldType;
  key: AnyModelKey;
  size?: FieldDataSize;
  options?: FieldDataOption[];
  relationModel?: string; // TODO: Add relation model type;
};

export type ModelConfigData = {
  name: string;
  displayName: ReactNode;
  indexName?: string;
  fields: ModelConfigField[];
  schema: z.AnyZodObject;
  url: string;
  sidebar?: boolean;
  manyRelations?: {
    [modelName: string]: {
      label: ReactNode;
      relationModel: string;
      key: string;
    };
  };
  isExportable: boolean;
};

export type WizardData = {
  title: ReactNode;
  href: string;
  icon: React.FC;
}[];

type ModelConfig = {
  [key: string]: ModelConfigData;
};

export const modelsConfig: ModelConfig = {
  users: {
    name: 'users',
    displayName: <Trans>Users</Trans>,
    indexName: AlgoliaIndex.USERS,
    url: 'users',
    fields: [
      { label: 'ID', type: 'ID', key: 'id' },
      { label: <Trans>Name</Trans>, type: 'text', key: 'name' },
      { label: <Trans>E-mail</Trans>, type: 'email', key: 'email' },
      { label: <Trans>Active</Trans>, type: 'boolean', key: 'active' },
      {
        label: <Trans>Super Admin</Trans>,
        type: 'boolean',
        key: 'isSuperAdmin',
      },
      { label: <Trans>Password</Trans>, type: 'password', key: 'password' },
      {
        label: <Trans>Workspaces</Trans>,
        type: 'manyRelation',
        key: 'workspaces',
        relationModel: 'workspace',
      },
    ],
    schema: userAdminModelSchema.pick({
      name: true,
      email: true,
      active: true,
      password: true,
      isSuperAdmin: true,
      workspaces: true,
    }),
    sidebar: true,
    isExportable: true,
  },
  globalFeatureFlags: {
    name: 'globalFeatureFlags',
    displayName: <Trans>Global Feature Flags</Trans>,
    indexName: AlgoliaIndex.GLOBAL_FEATURE_FLAGS,
    fields: [
      { label: 'ID', type: 'ID', key: 'id' },
      { label: <Trans>Flag</Trans>, type: 'text', key: 'flag' },
      { label: <Trans>Description</Trans>, type: 'text', key: 'description' },
      { label: <Trans>Released</Trans>, type: 'boolean', key: 'released' },
      {
        label: <Trans>Allow Workspace Control</Trans>,
        type: 'boolean',
        key: 'allowWorkspaceControl',
      },
    ],
    url: 'globalFeatureFlags',
    sidebar: true,
    schema: selectGlobalFeatureFlagsSchema.pick({
      description: true,
      released: true,
      allowWorkspaceControl: true,
    }),
    isExportable: false,
  },
  workspace: {
    name: 'workspace',
    displayName: <Trans>Workspaces</Trans>,
    indexName: AlgoliaIndex.WORKSPACES,
    url: 'workspace',
    sidebar: true,
    fields: [
      { label: 'ID', type: 'ID', key: 'id' },
      { label: <Trans>Name</Trans>, type: 'text', key: 'name' },
      {
        label: <Trans>Users</Trans>,
        type: 'manyRelation',
        key: 'users',
        relationModel: 'users',
      },
    ],
    schema: workspaceAdminModelSchema.pick({
      name: true,
      users: true,
    }),
    isExportable: true,
  },
  userWorkspaces: {
    name: 'userWorkspaces',
    displayName: <Trans>Users Workspaces</Trans>,
    url: 'user-workspaces',
    fields: [
      {
        label: <Trans>User ID</Trans>,
        key: 'userId',
        type: 'relation',
        relationModel: 'users',
      },
      {
        label: <Trans>Workspace ID</Trans>,
        key: 'workspaceId',
        type: 'relation',
        relationModel: 'workspace',
      },
    ],
    sidebar: false,
    schema: selectUserWorkspacesSchema.pick({
      userId: true,
      workspaceId: true,
    }),
    isExportable: false,
  },
  // TODO: use algolia in some models
  // tablesHistory: {
  //   name: 'tablesHistory',
  //   displayName: 'Tables History',
  //   indexName: AlgoliaIndex.TABLES_HISTORY,
  //   url: 'tables-history',
  //   fields: [
  //     { label: 'ID', type: 'ID', key: 'id' },
  //     { label: 'Table Name', type: 'text', key: 'tableName' },
  //     { label: 'Action', type: 'text', key: 'action' },
  //     { label: 'User ID', type: 'text', key: 'userId' },
  //     { label: 'Data', type: 'text', key: 'actionDescription' },
  //     { label: 'Created At', type: 'text', key: 'createdAt' },
  //   ],
  //   sidebar: true,
  //   schema: selectTablesHistorySchema.pick({
  //     tableName: true,
  //     action: true,
  //     userId: true,
  //     actionDescription: true,
  //     createdAt: true,
  //   }),
  //   isExportable: false,
  // },
};

// TODO: Remove this is an example
const wizardsNav: WizardData = [
  {
    title: <Trans>Wizard</Trans>,
    href: '/super-admin/wizard',
    icon: MagicWandIcon,
  },
];

const adminNav = Object.entries(modelsConfig)
  .filter(([, config]) => config.sidebar)
  .map(([, config]) => ({
    id: config.name,
    title: config.displayName,
    href: `/super-admin/${config.url}`,
    icon: StackIcon,
  }));

export const useNavAdmin = (): {
  title: string;
  href: string;
}[] => {
  const { t } = useTranslation();

  return [{ title: t('Super Admin'), href: '/super-admin/wizard' }];
};
const GoogleTagManagerNav = [
  {
    title: 'Google tag manager',
    href: '/super-admin/google-tag-manager',
    icon: GlobeIcon,
  },
];

const ChatBot = [
  {
    title: 'Chat Bot',
    href: '/super-admin/chat-bot',
    icon: ChatBubbleIcon,
  },
];

const taskRunnerNav = [
  {
    title: 'Task Runner',
    href: '/super-admin/async-tasks',
    icon: ClipboardIcon,
  },
];

export const navAdmin = [{ title: 'Admin', href: '/super-admin/wizard' }];

export const sidebarNavAdmin = [
  ...wizardsNav,
  ...adminNav,
  ...GoogleTagManagerNav,
  ...ChatBot,
  ...taskRunnerNav,
];
