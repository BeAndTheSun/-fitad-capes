import { globalFeatureFlags } from '@/db/schema';

import { algoliaModel } from './base';

export const globalFeatureFlagsAlgolia = algoliaModel({
  table: globalFeatureFlags,
  pkColumn: globalFeatureFlags.id,
  config: {
    id: true,
    flag: true,
    description: true,
    released: true,
    allowWorkspaceControl: true,
    createdAt: { canFilter: true, canSort: true },
  },
  includeRelations: {},
  notifyRelations: {},
});
