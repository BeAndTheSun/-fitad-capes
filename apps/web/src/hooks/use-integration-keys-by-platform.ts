import { IntegrationType } from '@meltstudio/types';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import type { IntegrationsKeys } from '@/common-types/site-integrations';

export const useIntegrationKeysByPlatform = (): Record<
  IntegrationsKeys,
  { name: string; label: string }[]
> => {
  const { t } = useTranslation();
  const integrationKeysByPlatform = useMemo(
    () => ({
      zapier: [
        {
          name: IntegrationType.WEBHOOK_URL,
          label: t('Webhook URL'),
        },
      ],
      shopify: [
        {
          name: IntegrationType.SHOPIFY_URL,
          label: t("Shopify's URL"),
        },
        {
          name: IntegrationType.SHOPIFY_ACCESS_TOKEN,
          label: t('Access token'),
        },
      ],
      stripe: [
        {
          name: IntegrationType.STRIPE_SECRET_LIVE_KEY,
          label: t('Stripe secret live key'),
        },
        {
          name: IntegrationType.STRIPE_SECRET_TEST_KEY,
          label: t('Stripe secret test key'),
        },
      ],
      'mercado-pago': [
        {
          name: IntegrationType.MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN,
          label: t('Mercado Pago production access token'),
        },
        {
          name: IntegrationType.MERCADO_PAGO_PUBLIC_PRODUCTION_KEY,
          label: t('Mercado Pago public production key'),
        },
        {
          name: IntegrationType.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN,
          label: t('Mercado Pago sandbox access token'),
        },
        {
          name: IntegrationType.MERCADO_PAGO_PUBLIC_SANDBOX_KEY,
          label: t('Mercado Pago public sandbox key'),
        },
      ],
      woocommerce: [
        {
          name: IntegrationType.WOOCOMMERCE_API_URL,
          label: t('WooCommerce API URL'),
        },
        {
          name: IntegrationType.WOOCOMMERCE_CONSUMER_KEY,
          label: t('WooCommerce consumer key'),
        },
        {
          name: IntegrationType.WOOCOMMERCE_CONSUMER_SECRET,
          label: t('WooCommerce consumer secret'),
        },
      ],
    }),
    [t]
  );
  return integrationKeysByPlatform;
};
