import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { integrationsApiDef } from './def';

export enum IntegrationsKeys {
  Zapier = 'zapier',
  Shopify = 'shopify',
  Stripe = 'stripe',
  MercadoPago = 'mercado-pago',
  WooCommerce = 'woocommerce',
}

export const integrationsRouter = ctx.router(integrationsApiDef);

integrationsRouter.get('/keys/:workspaceId/:platform', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { platform, workspaceId } = req.params;

  const integration =
    (await db.integration.findByWorkspaceAndPlatformWithKeys({
      platform,
      workspaceId,
    })) || null;

  return res.status(200).json(integration);
});

integrationsRouter.post('/keys/:workspaceId/:platform', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { platform, workspaceId } = req.params;
  const { enabled, keys } = req.body;

  await db.integration.saveIntegrationData({
    platform,
    workspaceId,
    enabled,
    keys,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (platform === IntegrationsKeys.Zapier) {
    const urlKey = keys.find((key) => key.name === 'WEBHOOK_URL');
    const url = urlKey?.value ?? '';

    const dataZapier = {
      workspaceId,
      name: platform,
      url,
    };

    await db.webhooks.create({
      data: dataZapier,
      activityStreamData: {
        userId: req.auth.user.id,
        workspaceId,
      },
    });
  }

  return res.status(201).end();
});
