import { AlgoliaIndex } from '@meltstudio/types';

import { users, userWorkspaces, workspace } from '@/db/schema';

import type { IncludeRelationDef } from './base';
import { algoliaModel } from './base';

export const userWorkspaceRelation: IncludeRelationDef<
  typeof workspace,
  typeof userWorkspaces
> = {
  type: 'many',
  index: AlgoliaIndex.USERS,
  model: algoliaModel({
    table: workspace,
    pkColumn: workspace.id,
    config: {
      id: {
        canFilter: true,
      },
      name: true,
      createdAt: true,
    },
  }),
  targetTable: userWorkspaces,
  keys: {
    foreignKey: userWorkspaces.userId,
    referenceKey: userWorkspaces.workspaceId,
  },
  includeRelationData: {
    role: true,
  },
};

export const user = algoliaModel({
  table: users,
  pkColumn: users.id,
  config: {
    id: true,
    name: true,
    email: true,
    active: true,
    createdAt: { canSort: true },
    isSuperAdmin: true,
  },
  includeRelations: {
    workspaces: userWorkspaceRelation,
  },
});
