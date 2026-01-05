import type { SearchClient } from 'algoliasearch';
import { algoliasearch } from 'algoliasearch';

import { config } from './config/env';

export type AlgoliaSearchClientInstance = SearchClient;
export class AlgoliaSearchClient {
  public static createAlgoliaClient(): AlgoliaSearchClientInstance {
    if (!config.algolia.app.id) {
      throw new Error(
        "environment variable 'NEXT_PUBLIC_ALGOLIA_APP_ID' is missing"
      );
    }

    if (!config.algolia.api.searchKey) {
      throw new Error(
        "environment variable 'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY' is missing"
      );
    }

    return algoliasearch(config.algolia.app.id, config.algolia.api.searchKey);
  }
}
