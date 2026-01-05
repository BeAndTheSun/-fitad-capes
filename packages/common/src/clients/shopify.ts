import { logger } from '@meltstudio/logger';
import type { IntegrationConfig } from '@meltstudio/types/src/site-integrations';
import * as Sentry from '@sentry/node';
import type { AdminRestApiClient } from '@shopify/admin-api-client';
import { createAdminRestApiClient } from '@shopify/admin-api-client';
import { LATEST_API_VERSION } from '@shopify/shopify-api';

import type {
  ShopifyCustomer,
  ShopifyCustomerInformation,
  ShopifyCustomers,
} from './types/shopify';

type ShopifyClientFunctions = {
  createCustomerInShopify: (
    customerInfo: ShopifyCustomerInformation
  ) => Promise<ShopifyCustomer | null>;
  isCustomerRegistered: (
    email: string,
    phone: string
  ) => Promise<boolean | null>;
  shopifyClient: AdminRestApiClient;
  getCustomer: (searchParams: {
    phone?: string;
    email?: string;
  }) => Promise<ShopifyCustomer | null>;
};

export const createShopifyClient = (
  config: IntegrationConfig
): ShopifyClientFunctions => {
  const { SHOPIFY_ACCESS_TOKEN, SHOPIFY_URL } = config.values;
  if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_URL) {
    throw new Error(
      "Shopify integration keys haven't been setup for this workspace"
    );
  }
  const client: AdminRestApiClient = createAdminRestApiClient({
    accessToken: SHOPIFY_ACCESS_TOKEN,
    storeDomain: SHOPIFY_URL,
    apiVersion: LATEST_API_VERSION,
  });

  const logAndCaptureError = (
    error: unknown,
    context: { [key: string]: Record<string, unknown> }
  ): void => {
    Sentry.captureException(error, { contexts: context });
    logger.error(error);
  };

  const getErrorMessage = ({
    errorStatus,
  }: {
    errorStatus: number;
  }): string => {
    switch (errorStatus) {
      case 401:
        return 'Shopify store credentials are incorrect, contact store owner if necessary';
      case 402:
      case 423:
        return 'Shopify store is not available, contact store owner';
      case 403:
        return 'Shopify store credentials are missing resource scope, contact store owner if necessary';
      case 404:
        return 'Resource not found on Shopify, contact store owner if necessary';
      case 409:
        return 'Resource is having issues on Shopify, contact store owner if necessary';
      case 422:
        return 'Incorrect data sent to Shopify, check request body';
      default:
        return `Unknown Shopify error, status: ${errorStatus}`;
    }
  };

  const validateShopifyResponse = async <T>(
    response: globalThis.Response
  ): Promise<T | null> => {
    const errors = (await response.json()) as {
      errors?: unknown;
      error?: unknown;
    };
    if (!response.ok) {
      logger.error(errors);

      Sentry.captureException(
        getErrorMessage({ errorStatus: response.status }),
        {
          contexts: { response: { ...errors, url: response.url } },
        }
      );
      return null;
    }

    return errors as T;
  };

  const createCustomerInShopify = async (
    customerInfo: ShopifyCustomerInformation
  ): Promise<ShopifyCustomer | null> => {
    try {
      const newCustomer = await client.post('customers', {
        data: { customer: customerInfo },
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await validateShopifyResponse(newCustomer);

      if (!response) {
        throw new Error('Invalid response from Shopify');
      }

      return response as ShopifyCustomer;
    } catch (error) {
      logAndCaptureError(error, {
        customer: customerInfo as unknown as Record<string, unknown>,
        config: { shopUrl: SHOPIFY_URL },
      });
      return null;
    }
  };

  const getCustomer = async (searchParams: {
    phone?: string;
    email?: string;
  }): Promise<ShopifyCustomer | null> => {
    const response = await client.get('customers', { searchParams });

    const validatedResponse =
      await validateShopifyResponse<ShopifyCustomers>(response);

    return validatedResponse?.customers?.[0] || null;
  };

  const isCustomerRegistered = async (
    email: ShopifyCustomer['email'],
    phone?: ShopifyCustomer['phone']
  ): Promise<boolean | null> => {
    try {
      const customerByEmail = await getCustomer({ email });
      if (customerByEmail && customerByEmail.id) return true;

      if (!phone) return false;

      const customerByPhone = await getCustomer({ phone });
      return !!customerByPhone;
    } catch (error) {
      logAndCaptureError(error, {
        customer: { email, phone },
        config: { shopUrl: SHOPIFY_URL },
      });
      return null;
    }
  };

  return {
    createCustomerInShopify,
    isCustomerRegistered,
    getCustomer,
    shopifyClient: client,
  };
};

export default createShopifyClient;
