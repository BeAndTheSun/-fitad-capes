import type { Algoliasearch } from 'algoliasearch';
import { algoliasearch } from 'algoliasearch';

import { config } from './config/env';

export type AlgoliaClientInstance = Algoliasearch;
export class AlgoliaClient {
  public static createAlgoliaClient(): AlgoliaClientInstance {
    if (!config.algolia.app.id) {
      throw new Error(
        "environment variable 'NEXT_PUBLIC_ALGOLIA_APP_ID' is missing"
      );
    }

    if (!config.algolia.api.adminKey) {
      throw new Error(
        "environment variable 'ALGOLIA_ADMIN_API_KEY' is missing"
      );
    }

    return algoliasearch(config.algolia.app.id, config.algolia.api.adminKey);
  }
}
