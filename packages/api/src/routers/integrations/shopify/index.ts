import { IntegrationHooks, ShopifyClient } from '@meltstudio/common';
import { logger } from '@meltstudio/logger';
import { IntegrationsKeys } from '@meltstudio/types';

import { ctx } from '@/api/context';

import { shopifyApiDef } from './def';

export const shopifyRouter = ctx.router(shopifyApiDef);

shopifyRouter.post('/:workspaceId/customer/create', async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const { workspaceId } = req.params;
  const shopifyConfig = await IntegrationHooks.loadConfig(
    workspaceId,
    IntegrationsKeys.Shopify
  );
  if (!shopifyConfig || !shopifyConfig.enabled) {
    return res.status(500).json({
      error: "Shopify integration hasn't been enabled",
    });
  }

  try {
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const shopifyClient = ShopifyClient(shopifyConfig);
    const customerResponse = await shopifyClient.createCustomerInShopify({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
    });

    if (!customerResponse) {
      return res.status(500).json({
        error: 'Failed to create customer in Shopify.',
      });
    }

    return res.status(200).json({ customer: customerResponse });
  } catch (error) {
    logger.error('Error creating customer:', error);

    return res.status(500).json({
      error: 'Error creating customer in Shopify',
    });
  }
});
shopifyRouter.post('/:workspaceId/customer/get', async (req, res) => {
  try {
    const { email, phone } = req.body;

    const { workspaceId } = req.params;
    const shopifyConfig = await IntegrationHooks.loadConfig(
      workspaceId,
      IntegrationsKeys.Shopify
    );
    if (!shopifyConfig || !shopifyConfig.enabled) {
      return res.status(500).json({
        error: "Shopify integration hasn't been enabled",
      });
    }

    const shopifyClient = ShopifyClient(shopifyConfig);

    const customerRes = await shopifyClient.getCustomer({
      email,
      phone,
    });

    if (!customerRes) {
      return res
        .status(400)
        .json({ error: 'Error fetching data from Shopify client no response' });
    }

    return res.status(200).json({ customer: customerRes });
  } catch (error) {
    return res.status(400).json({
      error: 'Error fetching data from Shopify client',
    });
  }
});
