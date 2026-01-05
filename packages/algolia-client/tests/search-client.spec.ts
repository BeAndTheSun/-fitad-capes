import { algoliasearch } from 'algoliasearch';

import { config } from '@/algolia-client/config/env';
import { AlgoliaSearchClient } from '@/algolia-client/search-client';

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(() => ({ client: 'mockClient' })),
}));

describe('AlgoliaSearchClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset config before each test
    config.algolia.app.id = '';
    config.algolia.api.searchKey = '';
  });

  describe('createAlgoliaClient', () => {
    it("should throw an error if 'NEXT_PUBLIC_ALGOLIA_APP_ID' is missing", () => {
      config.algolia.api.searchKey = 'mockSearchKey';

      expect(() => {
        AlgoliaSearchClient.createAlgoliaClient();
      }).toThrow(
        "environment variable 'NEXT_PUBLIC_ALGOLIA_APP_ID' is missing"
      );
    });

    it("should throw an error if 'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY' is missing", () => {
      config.algolia.app.id = 'mockAppId';

      expect(() => {
        AlgoliaSearchClient.createAlgoliaClient();
      }).toThrow(
        "environment variable 'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY' is missing"
      );
    });

    it('should create and return an Algolia search client', () => {
      config.algolia.app.id = 'mockAppId';
      config.algolia.api.searchKey = 'mockSearchKey';

      const client = AlgoliaSearchClient.createAlgoliaClient();

      expect(client).toBeDefined();
      expect(algoliasearch).toHaveBeenCalledWith('mockAppId', 'mockSearchKey');
      expect(algoliasearch).toHaveBeenCalledTimes(1); // Check that it was called once
    });
  });
});
