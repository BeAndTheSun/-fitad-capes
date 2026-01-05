import { authOptions } from '@meltstudio/auth';
import { Button } from '@meltstudio/theme';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth';
import type { ClientSafeProvider } from 'next-auth/react';
import { getProviders } from 'next-auth/react';
import { Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { z } from 'zod';

import { AuthLayout } from '@/layouts/auth-layout';
import type { NextPageWithLayout } from '@/types/next';
import { Typography } from '@/ui/typography';

const searchParamsSchema = z.object({
  error: z.string().optional().catch(undefined),
});

const AuthErrorPage: NextPageWithLayout<ServerSideProps> = () => {
  const router = useRouter();
  const searchParams = searchParamsSchema.parse(router.query);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Typography.H1 className="text-2xl font-semibold tracking-tight text-destructive lg:text-2xl">
          <Trans>There was an authentication error</Trans>
        </Typography.H1>

        {searchParams.error != null && (
          // TODO: improve this to show friendly messages
          <p className="text-sm text-destructive">{searchParams.error}</p>
        )}
      </div>

      <div className="grid w-full gap-6">
        <Button asChild>
          <Link href="/auth/sign-in">
            <Trans>Go to Sign in</Trans>
          </Link>
          <Link href="/auth/sign-in">
            <Trans>Go to Sign in</Trans>
          </Link>
        </Button>
      </div>
    </>
  );
};

type ServerSideProps = {
  providers: ClientSafeProvider[];
};
export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ServerSideProps>> {
  let props: ServerSideProps = {
    providers: [],
  };
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session != null) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale, 'en');

    props = {
      ...props,
      ...translations,
    };
  }

  return {
    props: {
      ...props,
      providers: Object.values(providers ?? {}),
    },
  };
}

AuthErrorPage.Layout = AuthLayout;

export default AuthErrorPage;
