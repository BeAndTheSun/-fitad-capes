import { AlgoliaIndex } from '@meltstudio/types';

import type { AlgoliaDataConfigCl } from './base';
import { globalFeatureFlagsAlgolia } from './global-feature-flags';
import { algoliaReports } from './reports';
import { algoliaTablesHistory } from './tables-history';
import { user } from './user';
import { workspaces } from './workspace';

export const models: Record<AlgoliaIndex, AlgoliaDataConfigCl> = {
  [AlgoliaIndex.USERS]: user,
  [AlgoliaIndex.GLOBAL_FEATURE_FLAGS]: globalFeatureFlagsAlgolia,
  [AlgoliaIndex.WORKSPACES]: workspaces,
  [AlgoliaIndex.TABLES_HISTORY]: algoliaTablesHistory,
  [AlgoliaIndex.REPORTS]: algoliaReports,
};
