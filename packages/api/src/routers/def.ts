import { mergeApis } from '@zodios/core';

import { adminApiDef } from './admin/def';
import { featureFlagsApi } from './feature-flags/def';
import { historicTableApiDef } from './historic-table/def';
import { integrationsApiDef } from './integrations/def';
import { shopifyApiDef } from './integrations/shopify/def';
import { metricsApiDef } from './metrics/def';
import { reportsApiDef } from './reports/def';
import { sessionApiDef } from './session/def';
import { storageApiDef } from './storage/def';
import { taskRunnerApiDef } from './task-runner/def';
import { userPersonalDataApiDef } from './user-personal-data/def';
import { userWorkspacesApiDef } from './user-workspaces/def';
import { usersApiDef } from './users/def';
import { venueUsersApiDef } from './venue-users/def';
import { venuesApi } from './venues/def';
import { webhooksApiDef } from './webhooks/def';
import { workspaceProfileApiDef } from './workspace-profile/def';

const zodiosApiDef = mergeApis({
  '/session': sessionApiDef,
  '/users': usersApiDef,
  '/storage': storageApiDef,
  '/feature-flags': featureFlagsApi,
  '/admin': adminApiDef,
  '/workspace-profile': workspaceProfileApiDef,
  '/metrics': metricsApiDef,
  '/integrations/shopify': shopifyApiDef,
  '/webhooks': webhooksApiDef,
  '/integrations': integrationsApiDef,
  '/task-runner': taskRunnerApiDef,
  '/historic-table': historicTableApiDef,
  '/user-workspaces': userWorkspacesApiDef,
  '/reports': reportsApiDef,
  '/venues': venuesApi,
  '/venue-users': venueUsersApiDef,
  '/user-personal-data': userPersonalDataApiDef,
});

export const apiDef = mergeApis({
  '/api': zodiosApiDef,
});
