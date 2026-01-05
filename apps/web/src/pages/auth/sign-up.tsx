import { authOptions } from '@meltstudio/auth';
import {
  formatZodiosError,
  useGetInvitation,
  useMemberAcceptInvitation,
  useSignUp,
} from '@meltstudio/client-common';
import { useSearchParams } from '@meltstudio/core';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { signIn } from 'next-auth/react';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { z } from 'zod';

import { AuthLayout } from '@/layouts/auth-layout';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { useFormHelper } from '@/ui/index';
import { Typography } from '@/ui/typography';

const formSchema = z
  .object({
    name: z.string().nonempty(),
    email: z
      .string()
      .nonempty()
      .email()
      .transform((v) => v.trim())
      .transform((v) => v.toLowerCase()),
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

const SignUpPage: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const signUp = useSignUp();

  const getInvitation = useGetInvitation({
    queries: { token },
  });
  const acceptInvitation = useMemberAcceptInvitation();

  const handleSubmitFromInvitation = (
    values: FormValues,
    emailValue: string
  ): void => {
    if (getInvitation.data == null) return;

    acceptInvitation.mutate(
      {
        name: values.name,
        password: values.password1,
        token,
      },
      {
        onSuccess: async () => {
          await signIn('credentials', {
            email: emailValue,
            password: values.password1,
          });
        },
      }
    );
  };

  const handleSubmitFromSignUp = (
    values: FormValues,
    emailValue: string
  ): void => {
    signUp.mutate(
      {
        name: values.name,
        email: emailValue,
        password: values.password1,
      },
      {
        onSuccess: async () => {
          await signIn('credentials', {
            email: emailValue,
            password: values.password1,
          });
        },
      }
    );
  };

  const handleSubmit = (values: FormValues, emailValue: string): void => {
    if (getInvitation.data) {
      handleSubmitFromInvitation(values, emailValue);
    } else {
      handleSubmitFromSignUp(values, emailValue);
    }
  };

  const loading =
    signUp.isLoading ||
    (token && getInvitation.isLoading) ||
    acceptInvitation.isLoading;

  const formattedError = formatZodiosError('signUp', signUp.error);
  const formattedInvitationError = formatZodiosError(
    'getInvitation',
    getInvitation.error
  );
  const formattedAcceptInvitationError = formatZodiosError(
    'memberAcceptInvitation',
    acceptInvitation.error
  );

  const error = formattedError || formattedAcceptInvitationError;

  const { formComponent, form } = useFormHelper(
    {
      schema: formSchema,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: t('Name'),
          size: 'full',
          required: true,
        },
        {
          name: 'email',
          type: 'text',
          label: t('E-mail'),
          size: 'full',
          required: true,
        },
        {
          name: 'password1',
          type: 'password',
          label: t('Password'),
          size: 'full',
          required: true,
        },
        {
          name: 'password2',
          type: 'password',
          label: t('Confirm Password'),
          size: 'full',
          required: true,
        },
      ],
      onSubmit: (values) => {
        const emailValue = form.getValues('email').trim().toLowerCase();
        handleSubmit(values, emailValue);
      },
      submitContent: t('Create account'),
      isLoading: loading,
      error,
    },
    {
      defaultValues: {
        name: '',
        email: '',
        password1: '',
        password2: '',
      },
    }
  );

  useEffect(() => {
    if (getInvitation.data) {
      form.setValue('email', getInvitation.data.email);
    }
  }, [form, getInvitation]);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Typography.H1 className="text-2xl font-semibold tracking-tight lg:text-2xl">
          <Trans>Create your account</Trans>
        </Typography.H1>

        <p className="text-sm text-muted-foreground">
          <Trans>Enter your information below to create your account</Trans>
        </p>

        {formattedInvitationError != null && (
          <div>
            <p className="mt-0 text-sm text-destructive">
              {formattedInvitationError.error}
            </p>
          </div>
        )}

        {error != null && (
          <div>
            <p className="text-sm text-destructive">
              <Trans>There was an error creating your account:</Trans>
            </p>
            <p className="mt-0 text-sm text-destructive">{error.error}</p>
          </div>
        )}
      </div>
      <div className="grid w-full gap-6">
        {formComponent}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              <Trans>Already have an account?</Trans>
            </span>
          </div>
        </div>

        <Button variant="outline" type="button" asChild>
          <Link href="/auth/sign-in">
            <Trans>Sign in</Trans>
          </Link>
        </Button>
      </div>
    </>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<unknown>> {
  const session = await getServerSession(context.req, context.res, authOptions);
  let props = {};

  if (session != null) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
}

SignUpPage.Layout = AuthLayout;

export default SignUpPage;
