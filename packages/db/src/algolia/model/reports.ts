import { algoliaModel } from '@/db/algolia/model/base';
import { reports } from '@/db/schema';

export const algoliaReports = algoliaModel({
  table: reports,
  pkColumn: reports.id,
  config: {
    id: true,
    name: {
      canFilter: true,
    },
    from: true,
    to: true,
    downloadUrl: true,
    reportStatus: {
      canFilter: true,
    },
    createdAt: { canSort: true },
    workspaceId: {
      canFilter: true,
    },
  },
});
