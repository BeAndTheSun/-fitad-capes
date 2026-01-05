import { useTranslation } from 'next-i18next';
import React from 'react';

import { IntegrationsKeys } from '@/common-types/site-integrations';
import { WebhookUrlsTable } from '@/components/webhooks/webhook-url-table';
import { Typography } from '@/ui/typography';

import { IntegrationRow } from './row';

const integrations = [
  {
    id: IntegrationsKeys.Zapier,
    name: 'Zapier',
    hasWebhooks: true,
  },
  {
    id: IntegrationsKeys.Shopify,
    name: 'Shopify',
  },
];

export const IntegrationsList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Typography.H3 className="mb-4">{t('Integrations')}</Typography.H3>
      <hr />
      {integrations.map(({ id, name, hasWebhooks }) => {
        return (
          <div>
            <IntegrationRow platformId={id} platformName={name} />
            <hr />
            {hasWebhooks && <WebhookUrlsTable />}
            <hr />
          </div>
        );
      })}
      <br />
    </div>
  );
};
