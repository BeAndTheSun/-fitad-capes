import { AlgoliaIndex } from '@meltstudio/types';

import type { users } from '@/db/schema';
import { userWorkspaces, workspace } from '@/db/schema';

import type { NotifyRelationDef } from './base';
import { algoliaModel } from './base';
import { user } from './user';

export const workspaceUserRelation: NotifyRelationDef<typeof users> = {
  type: 'many',
  model: user,
  index: AlgoliaIndex.USERS,
  targetTable: userWorkspaces,
  keys: {
    foreignKey: userWorkspaces.workspaceId,
    referenceKey: userWorkspaces.userId,
  },
};

export const workspaces = algoliaModel({
  table: workspace,

  pkColumn: workspace.id,
  config: {
    id: true,
    name: true,
    createdAt: { canSort: true },
  },

  notifyRelations: {
    users: workspaceUserRelation,
  },
});
