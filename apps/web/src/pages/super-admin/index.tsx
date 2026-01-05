import { Typography } from '@meltstudio/ui';
import * as Sentry from '@sentry/nextjs';
import type { GetServerSideProps } from 'next';
import { Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { Loading } from '@/components/common/loading';
import { useSessionUser } from '@/components/user/user-context';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';

const HomePage: NextPageWithLayout = () => {
  const { user, isLoading } = useSessionUser();

  if (!user || isLoading) {
    return <Loading />;
  }

  const handleUnhandledErrorClick = (): void => {
    throw new Error('Test: Unhandled error');
  };

  const handleHandledErrorClick = (): void => {
    Sentry.captureException(new Error('Test: Handled error'));
  };

  return (
    <div>
      <Typography.H1>
        <Trans>Welcome,</Trans> {user.name || user.email}
      </Typography.H1>

      <Typography.H2>Sentry</Typography.H2>
      <div>
        <Typography.Paragraph>
          <Trans>
            This template already includes the basic Sentry setup with
            sourcemaps. Clicking the following button should send a report of
            the error to Sentry:
          </Trans>
        </Typography.Paragraph>

        <div className="mt-2 flex flex-row space-x-1">
          <Button onClick={handleUnhandledErrorClick}>
            <Trans>Report unhandled to Sentry</Trans>
          </Button>
          <Button onClick={handleHandledErrorClick}>
            <Trans>Report handled to Sentry</Trans>
          </Button>
        </div>
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
