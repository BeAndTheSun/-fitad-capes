import { Typography } from '@meltstudio/ui';
import type { GetServerSideProps } from 'next';
import { Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { Loading } from '@/components/common/loading';
import { MetricsDashboard } from '@/components/metrics';
import { useSessionUser } from '@/components/user/user-context';
import { VenueOnwerDashboard } from '@/components/venue-owner-admin';
import { useViewAsMember } from '@/components/view-as-member/view-as-member-context';
import { useAdminViewAs } from '@/hooks/use-admin-view-as';
import type { NextPageWithLayout } from '@/types/next';

const HomePage: NextPageWithLayout = () => {
  const { user, isLoading, selectedWorkspace, isSuperAdmin } = useSessionUser();
  const { isViewingAsRole } = useViewAsMember();
  const {
    effectiveWorkspaceId,
    shouldShowMemberDashboard,
    shouldShowVenueOwnerDashboard,
  } = useAdminViewAs();

  if (!user || isLoading) {
    return <Loading />;
  }

  // Check if role view should be shown but no workspace is available
  if (shouldShowMemberDashboard && !effectiveWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Typography.H2>
          <Trans>No Workspace Available</Trans>
        </Typography.H2>
        {isSuperAdmin && isViewingAsRole ? (
          <div className="flex flex-col items-center gap-4">
            <Typography.Paragraph className="text-center text-muted-foreground">
              <Trans>
                Please select a workspace and role from the &quot;View As&quot;
                selector in the header.
              </Trans>
            </Typography.Paragraph>
          </div>
        ) : (
          <Typography.Paragraph className="text-center text-muted-foreground">
            <Trans>
              You are not currently assigned to any workspace. Please contact
              your administrator to be added to a workspace.
            </Trans>
          </Typography.Paragraph>
        )}
      </div>
    );
  }

  if (shouldShowVenueOwnerDashboard) {
    return <VenueOnwerDashboard />;
  }

  // TODO: Remove once super participant dashboard is ready
  if (shouldShowMemberDashboard) {
    return (
      <div>
        <Typography.H1>
          <Trans>Welcome,</Trans> {user.name || user.email} (
          {selectedWorkspace?.name})
        </Typography.H1>
        <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10">
          <Typography.H2>
            <Trans>Super Participant Dashboard</Trans>
          </Typography.H2>
          <Typography.Paragraph className="text-muted-foreground">
            <Trans>Work in progress</Trans>
          </Typography.Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Typography.H1>
        <Trans>Welcome,</Trans> {user.name || user.email} (
        {selectedWorkspace?.name})
      </Typography.H1>
      <Typography.H2>
        <Trans>Metrics</Trans>
      </Typography.H2>
      <div>
        <MetricsDashboard />
      </div>
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

export default HomePage;
