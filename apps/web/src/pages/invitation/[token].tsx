import {
  formatZodiosError,
  useGetInvitation,
  useMemberAcceptInvitation,
} from '@meltstudio/client-common';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';

import type { UserRoleEnum } from '@/common-types/index';
import { Loading } from '@/components/common/loading';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSessionUser } from '@/components/user/user-context';
import { NoLayout } from '@/layouts/no-layout';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  toast,
} from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { LanguageSelector } from '@/ui/language-toggle';
import { Typography } from '@/ui/typography';
import { UserAccountNav } from '@/ui/user-account-nav';
import { getUserRoleName } from '@/utils/localization';

const AcceptInvitePage: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const token = router.query.token as string;

  const { user, isLoading, invalidateUser } = useSessionUser();
  const { data: session, update } = useSession();
  const invitation = useGetInvitation({ queries: { token } });
  const acceptInvitation = useMemberAcceptInvitation();

  const loading = invitation.isLoading || isLoading;

  const isUserInvitation =
    user && invitation.data && invitation.data.email === user.email;

  const formattedInvitationError = formatZodiosError(
    'memberAcceptInvitation',
    acceptInvitation.error
  );

  const handleAcceptInvitation = (): void => {
    if (invitation.data) {
      acceptInvitation.mutate(
        { token },
        {
          onSuccess: async (data) => {
            const { workspaceId, name } = data;
            if (workspaceId) {
              await update({
                user: {
                  ...session?.user,
                  selectedWorkspace: {
                    id: workspaceId,
                    name,
                  },
                },
              });
            }

            await invalidateUser();
            await router.push('/');
          },
        }
      );
    }
  };

  const handleCancelInvitation = async (): Promise<void> => {
    await router.push('/');
  };

  const handleSignOutClick = async (): Promise<void> => {
    await signOut({ callbackUrl: '/auth/sign-in' });
  };

  useEffect(() => {
    const handleRouting = async (): Promise<void> => {
      if (!loading && invitation.data) {
        const { isNewUser } = invitation.data;

        // If the invitation is not for the user and there is an active user session, we redirect to the home page
        if (!isUserInvitation && !!user) {
          await router.push('/');
          toast({
            title: t('Invitation user mismatch'),
            description: t(
              'The current user cannot accept the invitation, please sign in or create an account with the correct user.'
            ),
            variant: 'destructive',
          });
        }

        if (isNewUser) {
          await router.push(`/auth/sign-up?token=${token}`);
        } else if (!user) {
          await router.push(`/auth/sign-in?callbackUrl=/invitation/${token}`);
          toast({
            title: t('Sign in required'),
            description: t(
              'Please sign in to your account to accept the invitation.'
            ),
            variant: 'default',
          });
        }
      } else if (!loading && !invitation.data) {
        await router.push('/');
        toast({
          title: t('Invitation not found'),
          description: t(
            'The invitation you are trying to access does not exist.'
          ),
          variant: 'destructive',
        });
      }
    };

    handleRouting().catch(() => {});
  }, [
    t,
    user,
    token,
    router,
    loading,
    isUserInvitation,
    invitation.data,
    invalidateUser,
  ]);

  // If invitation is not for the user, we don't show anything
  if (!loading && !isUserInvitation) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="absolute right-4 top-4 space-x-1 md:right-8 md:top-8">
            <LanguageSelector />
            <ThemeToggle />
            <UserAccountNav
              user={{
                name: user?.name ?? null,
                image: user?.profileImage ?? null,
                email: user?.email ?? null,
                role: invitation.data?.role
                  ? getUserRoleName(t, invitation.data.role as UserRoleEnum)
                  : 'User',
              }}
              onSignOutClick={handleSignOutClick}
            />{' '}
            <UserAccountNav
              user={{
                name: user?.name ?? null,
                image: user?.profileImage ?? null,
                email: user?.email ?? null,
                role: invitation.data?.role ?? 'User',
              }}
              onSignOutClick={handleSignOutClick}
            />
          </div>
          <Card className="max-w-md">
            <CardHeader>
              <Typography.H2>
                <Trans>Accept Invitation</Trans>
              </Typography.H2>
            </CardHeader>

            <CardContent>
              {formattedInvitationError != null && (
                <div>
                  <p className="mt-0 text-sm text-destructive">
                    {formattedInvitationError.error}
                  </p>
                </div>
              )}

              <Typography.Paragraph>
                <Trans>You&apos;ve been invited to join</Trans>{' '}
                <b>{invitation.data?.workspace}</b> <Trans>as</Trans>{' '}
                <b>
                  {invitation.data?.role
                    ? getUserRoleName(t, invitation.data.role as UserRoleEnum)
                    : 'User'}
                </b>
                .
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Trans>
                  In order to accept the invitation and join the workspace click
                  the button below.
                </Trans>
              </Typography.Paragraph>
            </CardContent>

            <CardFooter>
              <div className="flex grow justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelInvitation}
                  disabled={loading}
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button onClick={handleAcceptInvitation} loading={loading}>
                  <Trans>Accept</Trans>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

AcceptInvitePage.Layout = NoLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default AcceptInvitePage;
