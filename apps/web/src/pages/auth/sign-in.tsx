import { zodResolver } from '@hookform/resolvers/zod';
import { authOptions } from '@meltstudio/auth';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@meltstudio/theme';
import {
  AuthErrorCode,
  friendlyAuthErrorMessages,
  TwoFactorProvider,
} from '@meltstudio/types';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth';
import type { ClientSafeProvider, SignInOptions } from 'next-auth/react';
import { getProviders, signIn } from 'next-auth/react';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSessionUser } from '@/components/user/user-context';
import { useClientConfig } from '@/config/client';
import { AuthLayout } from '@/layouts/auth-layout';
import type { NextPageWithLayout } from '@/types/next';
import { Typography } from '@/ui/typography';

const searchParamsSchema = z.object({
  callbackUrl: z.string().nonempty().optional().catch(undefined),
  error: z.string().optional().catch(undefined),
});

const formSchema = z.object({
  email: z
    .string()
    .nonempty()
    .email()
    .transform((v) => v.trim())
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8),
});
type FormValues = z.infer<typeof formSchema>;

const SignInPage: NextPageWithLayout<ServerSideProps> = (props) => {
  const { t } = useTranslation();
  const { providers } = props;

  const router = useRouter();
  const { refetch } = useSessionUser();
  const searchParams = searchParamsSchema.parse(router.query);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [showOTP, setShowOTP] = useState<boolean>(false);
  const [totpCode, setTotpCode] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const clientConfig = useClientConfig();

  const credentialsProvider = providers.find(
    (provider) => provider.id === 'credentials'
  );
  const remainingProviders = providers.filter(
    (provider) => provider.id !== 'credentials'
  );

  const twoFactorProvider = clientConfig.twoFactorAuth.provider;

  const handleCredentialsFormSubmit = async (
    values: { totpCode?: string } & FormValues
  ): Promise<void> => {
    setIsSigningIn(true);
    if (searchParams.error) {
      // Clear the error query param
      if (searchParams.error) {
        // Preserve callbackUrl and other params when pushing the error
        const { error: _error, ...restParams } = router.query;
        await router.push(
          {
            pathname: '/auth/sign-in',
            query: restParams, // This preserves other query params like callbackUrl
          },
          {},
          { shallow: true }
        );
      }
    }
    let prefix = '';
    if (router.locale) prefix = `/${router.locale}`;
    const options: SignInOptions = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      // redirect: false is necessary to provide a better user experience and
      // handle sign in errors without doing a full page refresh because of the
      // redirection
      // https://next-auth.js.org/getting-started/client#using-the-redirect-false-option
      redirect: false,
    };
    if (values.totpCode != null) {
      options.totpCode = values.totpCode;
    }
    if (searchParams.callbackUrl != null) {
      options.callbackUrl = searchParams.callbackUrl;
    }

    // signIn returns a response that can be used to handle success and error
    // when redirect: false is used
    const result = await signIn('credentials', options);
    if (result == null) {
      setIsSigningIn(false);
      return;
    }

    if (result.ok) {
      await refetch();
      await router.push(result.url ? `${result.url}` : `${prefix}/`);
    } else if (result.error === AuthErrorCode.SecondFactorRequired) {
      setShowOTP(true);
    } else {
      // Preserve callbackUrl and other params when pushing the error
      const restParams = router.query;
      await router.push({
        pathname: `${prefix}/auth/sign-in`,
        query: { ...restParams, error: result.error }, // Keep other params and add the error
      });
    }
    setIsSigningIn(false);
  };

  return showOTP ? (
    <div className="flex flex-col space-y-2 text-center">
      <Head>
        <title>{t('Sign in')}</title>
      </Head>
      <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
        <Trans>Sign in to your account</Trans>
      </Typography.H1>
      {credentialsProvider != null && (
        <p className="text-sm text-muted-foreground">
          {twoFactorProvider === TwoFactorProvider.AUTHENTICATOR
            ? t('Enter your generated code below to sign in to your account')
            : t(
                'Enter the OTP code sent to your email to sign in to your account'
              )}
        </p>
      )}

      {searchParams.error != null && (
        <div>
          <p className="text-sm text-destructive">
            <Trans>There was an error signing you in:</Trans>
          </p>
          <p className="mt-0 text-sm text-destructive">
            {friendlyAuthErrorMessages[searchParams.error] ??
              searchParams.error}
          </p>
        </div>
      )}
      <Input
        type="text"
        placeholder={t('OTP code')}
        onChange={(e): void => {
          setTotpCode(e.target.value);
        }}
      />
      <Button
        onClick={async (): Promise<void> => {
          const formValues = form.getValues();
          await handleCredentialsFormSubmit({
            ...formValues,
            totpCode,
          });
        }}
        loading={isSigningIn}
      >
        <Trans>Sign in</Trans>
      </Button>
    </div>
  ) : (
    <>
      <Head>
        <title>{t('Sign in')}</title>
      </Head>
      <div className="flex flex-col space-y-2 text-center">
        <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
          <Trans>Sign in to your account</Trans>
        </Typography.H1>
        {credentialsProvider != null && (
          <p className="text-sm text-muted-foreground">
            <Trans>Enter your email below to sign in to your</Trans>
          </p>
        )}

        {searchParams.error != null && (
          <div>
            <p className="text-sm text-destructive">
              <Trans>There was an error signing you in:</Trans>
            </p>
            <p className="mt-0 text-sm text-destructive">
              {friendlyAuthErrorMessages[searchParams.error] ??
                searchParams.error}
            </p>
          </div>
        )}
      </div>

      <div className="grid w-full gap-6">
        {credentialsProvider != null && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCredentialsFormSubmit)}
              className="grid w-full gap-2"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }): React.ReactElement => (
                  <FormItem className="w-full">
                    <FormLabel className="sr-only">
                      <Trans>E-mail</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('E-mail')}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }): React.ReactElement => (
                  <FormItem className="w-full">
                    <FormLabel className="sr-only">
                      <Trans>Password</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('Password')}
                        autoComplete="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mb-2">
                <Link href="/auth/forgot">
                  <Typography.Subtle>
                    <Trans>Forgot your password?</Trans>
                  </Typography.Subtle>
                </Link>
              </div>

              <Button loading={isSigningIn} type="submit">
                <Trans>Sign in</Trans>
              </Button>
            </form>
          </Form>
        )}

        {credentialsProvider != null && remainingProviders.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                <Trans>Or continue with</Trans>
              </span>
            </div>
          </div>
        )}

        {remainingProviders.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            type="button"
            onClick={async (): Promise<void> => {
              await signIn(provider.id);
            }}
          >
            {provider.name}
          </Button>
        ))}
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
  const session = await getServerSession(context.req, context.res, authOptions);
  let props = {};

  if (session != null) {
    let prefix = '';
    if (context.locale != null) {
      prefix = `/${context.locale}`;
    }

    const callbackUrl = (context.query.callbackUrl as string) || `${prefix}/`;

    return {
      redirect: {
        destination: callbackUrl,
        permanent: false,
      },
    };
  }
  const providers = await getProviders();

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);
    props = { ...props, ...translations };
  }

  return {
    props: {
      providers: Object.values(providers ?? {}),
      ...props,
    },
  };
}

SignInPage.Layout = AuthLayout;

export default SignInPage;
