import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { WebhookUrlsTable } from '@/components/webhooks/webhook-url-table';
import { FeatureFlag, FeatureFlagWrapper } from '@/feature-flags/index';
import type { NextPageWithLayout } from '@/types/next';

const WebhooksPage: NextPageWithLayout = () => {
  return (
    <div>
      <FeatureFlagWrapper flag={FeatureFlag.WEBHOOKS_MODULE}>
        <WebhookUrlsTable />
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

export default WebhooksPage;
