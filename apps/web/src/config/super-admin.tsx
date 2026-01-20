import type { AnyModelKey } from '@meltstudio/zod-schemas';
import {
  userAdminModelSchema,
  venueAdminModelSchema,
  workspaceAdminModelSchema,
} from '@meltstudio/zod-schemas';
import { MagicWandIcon, StackIcon } from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import React from 'react';
import { z } from 'zod';

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
  required?: boolean;
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
    ],
    schema: userAdminModelSchema
      .pick({
        name: true,
        email: true,
        active: true,
        password: true,
      })
      .extend({
        isSuperAdmin: z.boolean(),
        role: z.string().optional(),
      }),
    sidebar: true,
    isExportable: true,
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

  venue: {
    name: 'venue',
    displayName: <Trans>Venues</Trans>,
    indexName: AlgoliaIndex.VENUES,
    url: 'venue',
    sidebar: true,
    fields: [
      { label: 'ID', type: 'ID', key: 'id' },
      { label: <Trans>Name</Trans>, type: 'text', key: 'name' },
      {
        label: <Trans>Description</Trans>,
        type: 'textarea',
        key: 'description',
      },
      { label: <Trans>City</Trans>, type: 'text', key: 'city' },
      { label: <Trans>Country</Trans>, type: 'text', key: 'country' },
      { label: <Trans>Address</Trans>, type: 'text', key: 'address' },
      { label: <Trans>Brand Color</Trans>, type: 'color', key: 'brand_color' },
      { label: <Trans>Logo</Trans>, type: 'file', key: 'logo_file' },
      {
        label: <Trans>Active</Trans>,
        type: 'boolean',
        key: 'isActive',
      },
      {
        label: <Trans>Owner</Trans>,
        type: 'relation',
        key: 'ownerId',
        relationModel: 'users',
      },
      {
        label: 'Phone number',
        type: 'text',
        key: 'phone_number',
        required: false,
      },
      {
        label: 'Company website',
        type: 'text',
        key: 'company_website',
        required: false,
      },
      {
        label: 'Superfit menu link',
        type: 'text',
        key: 'superfit_menu_link',
        required: false,
      },
      {
        label: 'Social media page',
        type: 'text',
        key: 'social_media_page',
        required: false,
      },
    ],
    schema: venueAdminModelSchema
      .pick({
        name: true,
        description: true,
        city: true,
        country: true,
        address: true,
        brand_color: true,
        ownerId: true,
        isActive: true,
      })
      .merge(
        venueAdminModelSchema
          .pick({
            phone_number: true,
            company_website: true,
            superfit_menu_link: true,
            social_media_page: true,
          })
          .partial()
      )
      .extend({
        logo_file: z
          .union([z.instanceof(File), z.string()])
          .nullable()
          .optional(),
      }),
    isExportable: true,
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

export const navAdmin = [{ title: 'Admin', href: '/super-admin/wizard' }];

export const sidebarNavAdmin = [...wizardsNav, ...adminNav];
