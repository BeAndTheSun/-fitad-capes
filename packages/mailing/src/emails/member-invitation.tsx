import { getBaseUrl } from '@meltstudio/core';
import { Column, Container, Section } from '@react-email/components';

import { BaseLayout } from '@/mailing/components/base-layout';
import { EmailButton } from '@/mailing/components/button';
import { Footer } from '@/mailing/components/footer';
import { Header } from '@/mailing/components/header';
import { Heading } from '@/mailing/components/heading';
import { EmailText } from '@/mailing/components/text';
import type { EmailTemplate } from '@/mailing/types';

type MemberInvitationProps = {
  by: string;
  workspace: string;
  token: string;
};

const MemberInvitation: EmailTemplate<MemberInvitationProps> = ({
  by,
  workspace,
  token,
}) => {
  const inviteLink = `${getBaseUrl()}/invitation/${token}`;

  return (
    <BaseLayout>
      <Header />
      <Container>
        <Section className="px-6 py-8">
          <Column align="center">
            <Heading className="mb-4 text-center text-2xl font-bold sm:text-3xl">
              You're Invited!
            </Heading>
            <EmailText className="mb-6 max-w-md text-center text-base text-gray-600">
              <strong>{by}</strong> has invited you to join the{' '}
              <strong>{workspace}</strong> workspace. Click the button below to
              accept the invitation and create your account.
            </EmailText>

            <EmailButton href={inviteLink}>Accept Invitation</EmailButton>

            <EmailText className="mt-6 text-center text-sm text-gray-500">
              This invitation will expire in 2 days. If you have any questions,
              please contact the person who invited you.
            </EmailText>
          </Column>
        </Section>
      </Container>

      <Footer />
    </BaseLayout>
  );
};

MemberInvitation.subject = 'You have been invited to join a workspace';

// Default props for preview - these won't affect production emails
MemberInvitation.PreviewProps = {
  by: 'Sarah Johnson',
  workspace: 'Acme Corp',
  token: 'sample-invitation-token-123456',
} as MemberInvitationProps;

export default MemberInvitation;
