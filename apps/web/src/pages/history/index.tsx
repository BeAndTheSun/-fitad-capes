import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { HistoricTable } from '@/components/historic-table';
import { FeatureFlag, FeatureFlagWrapper } from '@/feature-flags/index';
import type { NextPageWithLayout } from '@/types/next';

const HistoryPage: NextPageWithLayout = () => {
  return (
    <div>
      <FeatureFlagWrapper flag={FeatureFlag.HISTORY_MODULE}>
        <HistoricTable />
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

export default HistoryPage;
