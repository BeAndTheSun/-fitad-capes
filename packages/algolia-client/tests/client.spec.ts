import { algoliasearch } from 'algoliasearch';

import { config } from '@/algolia-client/config/env';
import { AlgoliaClient } from '@/algolia-client/index';

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(() => ({ client: 'mockClient' })),
}));

describe('AlgoliaClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    config.algolia.app.id = '';
    config.algolia.api.adminKey = '';
  });

  describe('createAlgoliaClient', () => {
    it("should throw an error if 'NEXT_PUBLIC_ALGOLIA_APP_ID' is missing", () => {
      config.algolia.api.adminKey = 'mockAdminKey';

      expect(() => {
        AlgoliaClient.createAlgoliaClient();
      }).toThrow(
        "environment variable 'NEXT_PUBLIC_ALGOLIA_APP_ID' is missing"
      );
    });

    it("should throw an error if 'ALGOLIA_ADMIN_API_KEY' is missing", () => {
      config.algolia.app.id = 'mockAppId';

      expect(() => {
        AlgoliaClient.createAlgoliaClient();
      }).toThrow("environment variable 'ALGOLIA_ADMIN_API_KEY' is missing");
    });

    it('should create and return an Algolia client', () => {
      config.algolia.app.id = 'mockAppId';
      config.algolia.api.adminKey = 'mockAdminKey';

      const client = AlgoliaClient.createAlgoliaClient();

      expect(client).toBeDefined();
      expect(client).toEqual({ client: 'mockClient' });
      expect(algoliasearch).toHaveBeenCalledWith('mockAppId', 'mockAdminKey');
    });
  });
});
