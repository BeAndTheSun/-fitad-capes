import { zodResolver } from '@hookform/resolvers/zod';
import { authOptions } from '@meltstudio/auth';
import {
  formatZodiosError,
  useRecoverPassword,
} from '@meltstudio/client-common';
import { useParsedSearchParams } from '@meltstudio/core';
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
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/layouts/auth-layout';
import type { NextPageWithLayout } from '@/types/next';
import { Typography } from '@/ui/typography';

const searchParamsSchema = z.object({
  token: z.string().nonempty().catch(''),
});

const formSchema = z
  .object({
    password1: z.string().min(8),
    password2: z.string().min(8),
  })
  .superRefine((val, ctx) => {
    if (val.password1 !== val.password2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ['password2'],
      });
    }
  });
type FormValues = z.infer<typeof formSchema>;

const RecoverPasswordPage: NextPageWithLayout = () => {
  const searchParams = useParsedSearchParams(searchParamsSchema);
  const recoverPassword = useRecoverPassword();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password1: '',
      password2: '',
    },
  });

  const formattedError = formatZodiosError(
    'recoverPassword',
    recoverPassword.error
  );

  if (formattedError) {
    return (
      <>
        <div className="flex flex-col space-y-2 text-center">
          <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
            <Trans>Recover your password</Trans>
          </Typography.H1>

          <p className="text-sm text-destructive">
            <Trans>There was an error recovering your password:</Trans>
          </p>
          <p className="text-sm text-destructive">{formattedError.error}</p>
        </div>

        <div className="grid w-full gap-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/auth/forgot">
              <Trans>Start the process again</Trans>
            </Link>
          </Button>
        </div>
      </>
    );
  }

  if (recoverPassword.isSuccess) {
    return (
      <>
        <div className="flex flex-col space-y-2 text-center">
          <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
            <Trans>Recover your password</Trans>
          </Typography.H1>

          <p className="text-sm text-muted-foreground">
            <Trans>Successfully changed your password!</Trans>
          </p>
        </div>

        <div className="grid w-full gap-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/auth/sign-in">
              <Trans>Go to Sign in</Trans>
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const handleSubmit = (values: FormValues): void => {
    recoverPassword.mutate(
      {
        token: searchParams.token,
        password: values.password1,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
          <Trans>Recover your password</Trans>
        </Typography.H1>

        <p className="text-sm text-muted-foreground">
          <Trans>Enter your new password below to change it</Trans>
        </p>
      </div>

      <div className="grid w-full gap-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid w-full gap-2"
          >
            <FormField
              control={form.control}
              name="password1"
              render={({ field }): React.ReactElement => (
                <FormItem className="w-full">
                  <FormLabel className="sr-only">
                    <Trans>Password</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Password"
                      autoComplete="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password2"
              render={({ field }): React.ReactElement => (
                <FormItem className="mb-2 w-full">
                  <FormLabel className="sr-only">
                    <Trans>Confirm your password</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm your password"
                      autoComplete="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">
              <Trans>Set password</Trans>
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<unknown>> {
  let props = {};
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session != null) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale, 'en');

    props = { ...props, ...translations };
  }

  return { props };
}

RecoverPasswordPage.Layout = AuthLayout;

export default RecoverPasswordPage;
