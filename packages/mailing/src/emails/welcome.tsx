import { getBaseUrl } from '@meltstudio/core';
import { Column, Container, Section } from '@react-email/components';

import { BaseLayout } from '@/mailing/components/base-layout';
import { EmailButton } from '@/mailing/components/button';
import { Footer } from '@/mailing/components/footer';
import { Header } from '@/mailing/components/header';
import { Heading } from '@/mailing/components/heading';
import { EmailText } from '@/mailing/components/text';
import type { EmailTemplate } from '@/mailing/types';

const Welcome: EmailTemplate = () => {
  return (
    <BaseLayout>
      <Header />

      <Container>
        <Section className="px-6 py-8">
          <Column align="center">
            <Heading className="mb-4 text-center text-2xl font-bold sm:text-3xl">
              Welcome to Fit ADS!
            </Heading>
            <EmailText className="mb-6 max-w-md text-center text-base text-gray-600">
              Thank you for creating your account. You're now ready to start
              using the application and explore all the features we have to
              offer.
            </EmailText>

            <EmailButton href={getBaseUrl()}>Get Started</EmailButton>

            <EmailText className="mt-6 text-center text-sm text-gray-500">
              If you have any questions, feel free to contact our support team.
            </EmailText>
          </Column>
        </Section>
      </Container>

      <Footer />
    </BaseLayout>
  );
};
Welcome.subject = 'Welcome to Fit ADS!';

export default Welcome;
