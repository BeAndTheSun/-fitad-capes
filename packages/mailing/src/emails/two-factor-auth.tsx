import { getBaseUrl } from '@meltstudio/core';
import { Column, Container, Section } from '@react-email/components';

import { BaseLayout } from '@/mailing/components/base-layout';
import { EmailButton } from '@/mailing/components/button';
import { Footer } from '@/mailing/components/footer';
import { Header } from '@/mailing/components/header';
import { Heading } from '@/mailing/components/heading';
import { EmailText } from '@/mailing/components/text';
import type { EmailTemplate } from '@/mailing/types';

type TwoFactorAuthProps = {
  code: string;
  userName: string;
};

const TwoFactorAuth: EmailTemplate<TwoFactorAuthProps> = (props) => {
  const { code, userName } = props;

  return (
    <BaseLayout>
      <Header />

      <Container>
        <Section className="px-6 py-8">
          <Column align="center">
            <Heading className="mb-4 text-center text-2xl font-bold sm:text-3xl">
              Security Code
            </Heading>
            <EmailText className="mb-6 max-w-md text-center text-base text-gray-600">
              Hello {userName}, we've generated a security code to verify your
              identity. Please enter the following code in the application:
            </EmailText>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 24px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <EmailText
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  letterSpacing: '2px',
                  margin: 0,
                }}
              >
                {code}
              </EmailText>
            </div>

            <EmailButton href={getBaseUrl()}>Go to App</EmailButton>

            <EmailText className="mt-6 text-center text-sm text-gray-500">
              This code will expire in 10 minutes. If you didn't request this
              code, please ignore this email.
            </EmailText>
          </Column>
        </Section>
      </Container>

      <Footer />
    </BaseLayout>
  );
};

TwoFactorAuth.subject = 'Two-factor authentication code';

// Default props for preview - these won't affect production emails
TwoFactorAuth.PreviewProps = {
  code: '123456',
  userName: 'John Doe',
} as TwoFactorAuthProps;

export default TwoFactorAuth;
