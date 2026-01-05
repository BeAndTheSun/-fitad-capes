import { Column, Container, Section } from '@react-email/components';

import { BaseLayout } from '@/mailing/components/base-layout';
import { EmailButton } from '@/mailing/components/button';
import { Footer } from '@/mailing/components/footer';
import { Header } from '@/mailing/components/header';
import { Heading } from '@/mailing/components/heading';
import { EmailText } from '@/mailing/components/text';
import type { EmailTemplate } from '@/mailing/types';

type DatabaseExportProps = {
  downloadLink: string;
};

const DatabaseExport: EmailTemplate<DatabaseExportProps> = ({
  downloadLink,
}) => {
  return (
    <BaseLayout>
      <Header />
      <Container>
        <Section className="px-6 py-8">
          <Column align="center">
            <Heading className="mb-4 text-center text-2xl font-bold sm:text-3xl">
              Export Complete
            </Heading>
            <EmailText className="mb-6 max-w-md text-center text-base text-gray-600">
              Your database export has been successfully processed and is ready
              for download. The export includes all your data in CSV format.
            </EmailText>

            <EmailButton href={downloadLink}>Download Export</EmailButton>

            <EmailText className="mt-6 text-center text-sm text-gray-500">
              This download link will expire in 48 hours for security reasons.
              If you need a new export, please request it from your dashboard.
            </EmailText>
          </Column>
        </Section>
      </Container>

      <Footer />
    </BaseLayout>
  );
};

DatabaseExport.subject = 'Your database export is ready';

// Default props for preview - these won't affect production emails
DatabaseExport.PreviewProps = {
  downloadLink: 'https://example.com/download/export-2024-01-15.zip',
} as DatabaseExportProps;

export default DatabaseExport;
