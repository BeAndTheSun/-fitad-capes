import { getBaseUrl } from '@meltstudio/core';
import { Column, Container, Section } from '@react-email/components';

import { BaseLayout } from '@/mailing/components/base-layout';
import { EmailButton } from '@/mailing/components/button';
import { Footer } from '@/mailing/components/footer';
import { Header } from '@/mailing/components/header';
import { Heading } from '@/mailing/components/heading';
import { EmailText } from '@/mailing/components/text';
import type { EmailTemplate } from '@/mailing/types';

type ForgotPasswordProps = {
  token: string;
};

const ForgotPassword: EmailTemplate<ForgotPasswordProps> = (props) => {
  const { token } = props;

  return (
    <BaseLayout>
      <Header />
      <Container>
        <Section className="px-6 py-8">
          <Column align="center">
            <Heading className="mb-4 text-center text-2xl font-bold sm:text-3xl">
              Password Reset Request
            </Heading>
            <EmailText className="mb-6 max-w-md text-center text-base text-gray-600">
              We received a request to reset your password. Click the button
              below to choose a new password for your account.
            </EmailText>

            <EmailButton
              href={`${getBaseUrl()}/auth/recover?token=%22${token}%22`}
            >
              Reset Password
            </EmailButton>

            <EmailText className="mt-6 text-center text-sm text-gray-500">
              If you didn't request a password reset, you can safely ignore this
              email. The link will expire in 24 hours.
            </EmailText>
          </Column>
        </Section>
      </Container>

      <Footer />
    </BaseLayout>
  );
};

ForgotPassword.subject = 'Recover your password';

// Default props for preview - these won't affect production emails
ForgotPassword.PreviewProps = {
  token: 'sample-reset-token-123456',
} as ForgotPasswordProps;

export default ForgotPassword;
