import { zodResolver } from '@hookform/resolvers/zod';
import { authOptions } from '@meltstudio/auth';
import {
  formatZodiosError,
  useSendPasswordRecoveryEmail,
} from '@meltstudio/client-common';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useToast,
} from '@meltstudio/theme';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/layouts/auth-layout';
import type { NextPageWithLayout } from '@/types/next';
import { Typography } from '@/ui/typography';

const formSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
});
type FormValues = z.infer<typeof formSchema>;

const ForgotPasswordPage: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const sendPasswordRecoveryEmail = useSendPasswordRecoveryEmail();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
  const { toast } = useToast();

  const formattedError = formatZodiosError(
    'sendPasswordRecoveryEmail',
    sendPasswordRecoveryEmail.error
  );

  if (sendPasswordRecoveryEmail.isSuccess) {
    return (
      <div className="flex w-full flex-col space-y-2 text-center">
        <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
          <Trans>Password recovery e-mail sent!</Trans>
        </Typography.H1>

        <p className="text-sm text-muted-foreground">
          <Trans>Go to your inbox to continue with the process</Trans>
        </p>
      </div>
    );
  }

  const handleSubmit = (values: FormValues): void => {
    sendPasswordRecoveryEmail.mutate(
      {
        email: values.email,
      },
      {
        onSuccess: () => {
          form.reset();
          toast({
            title: t('Password recovery e-mail sent!'),
            description: t('Go to you inbox to continue the process'),
          });
        },
      }
    );
  };

  return (
    <>
      <div className="flex w-full flex-col space-y-2 text-center">
        <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
          <Trans>Recover your password</Trans>
        </Typography.H1>

        <p className="text-sm text-muted-foreground">
          <Trans>Enter your e-mail below to recover your password</Trans>
        </p>

        {formattedError != null && (
          <div>
            <p className="text-sm text-destructive">
              <Trans>There was an error recovering your password:</Trans>
            </p>
            <p className="mt-0 text-sm text-destructive">
              {formattedError.error}
            </p>
          </div>
        )}
      </div>

      <div className="grid w-full gap-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
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
                      placeholder="E-mail"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">
              <Trans>Send E-mail</Trans>
            </Button>

            <Button variant="outline" type="button" asChild>
              <Link href="/auth/sign-in">
                <Trans>Go back to sign in</Trans>
              </Link>
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

ForgotPasswordPage.Layout = AuthLayout;

export default ForgotPasswordPage;
