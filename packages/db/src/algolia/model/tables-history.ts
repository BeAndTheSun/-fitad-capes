import { AlgoliaIndex } from '@meltstudio/types';

import { tablesHistory, users } from '@/db/schema';

import type { NotifyRelationDef } from './base';
import { algoliaModel } from './base';
import { user } from './user';

export const userIdFormRelation: NotifyRelationDef = {
  type: 'one',
  model: user,
  index: AlgoliaIndex.TABLES_HISTORY,
  targetTable: users,
  keys: {
    foreignKey: tablesHistory.userId,
  },
};

export const algoliaTablesHistory = algoliaModel({
  table: tablesHistory,
  pkColumn: tablesHistory.id,
  config: {
    id: true,
    action: {
      canFilter: true,
    },
    tableName: true,
    createdAt: { canSort: true },
    workspaceId: {
      canFilter: true,
    },
    userId: true,
  },
  includeRelations: {
    user: userIdFormRelation,
  },
  notifyRelations: {
    userId: userIdFormRelation,
  },
});
