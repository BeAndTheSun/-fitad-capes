import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { VenueInvitationAcceptanceView } from '@/components/venues/invitation-acceptance-view';
import type { NextPageWithLayout } from '@/types/next';

const VenueInvitationPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { token, workspaceId } = router.query;

  if (!token || typeof token !== 'string') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-destructive">Invalid invitation link</div>
      </div>
    );
  }

  if (!workspaceId || typeof workspaceId !== 'string') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-destructive">
          Missing workspace information
        </div>
      </div>
    );
  }

  return (
    <VenueInvitationAcceptanceView token={token} workspaceId={workspaceId} />
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

export default VenueInvitationPage;
