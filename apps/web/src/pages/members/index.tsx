import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { MembersTableProvider } from '@/components/members/members-context';
import { MembersTable } from '@/components/members/members-table';
import { FeatureFlag, FeatureFlagWrapper } from '@/feature-flags/index';
import type { NextPageWithLayout } from '@/types/next';

const MembersPage: NextPageWithLayout = () => {
  return (
    <FeatureFlagWrapper flag={FeatureFlag.MEMBERS_MANAGEMENT}>
      <MembersTableProvider>
        <MembersTable />
      </MembersTableProvider>
    </FeatureFlagWrapper>
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

export default MembersPage;
