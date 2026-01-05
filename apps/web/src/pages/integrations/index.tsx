import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { IntegrationsKeys } from '@/common-types/site-integrations';
import { IntegrationRow } from '@/components/integrations/row';
import { FeatureFlag, FeatureFlagWrapper } from '@/feature-flags/index';
import type { NextPageWithLayout } from '@/types/next';
import { Typography } from '@/ui/typography';

const integrations = [
  {
    id: IntegrationsKeys.Zapier,
    name: 'Zapier',
  },
  {
    id: IntegrationsKeys.Shopify,
    name: 'Shopify',
  },
  {
    id: IntegrationsKeys.Stripe,
    name: 'Stripe',
  },
  {
    id: IntegrationsKeys.MercadoPago,
    name: 'Mercado Pago',
  },
  {
    id: IntegrationsKeys.WooCommerce,
    name: 'WooCommerce',
  },
];

const IntegrationsPage: NextPageWithLayout = () => {
  const { t } = useTranslation();

  return (
    <div>
      <FeatureFlagWrapper flag={FeatureFlag.INTEGRATIONS_MODULE}>
        <Typography.H3 className="mb-4">{t('Integrations')}</Typography.H3>
        <hr />
        {integrations.map(({ id, name }) => {
          return (
            <div key={id}>
              <IntegrationRow platformId={id} platformName={name} />
              <hr />
            </div>
          );
        })}
      </FeatureFlagWrapper>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default IntegrationsPage;
