import { useExportDatabaseToCSV } from '@meltstudio/client-common';
import type { GetServerSideProps } from 'next';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { z } from 'zod';

import { AsyncTasksTable } from '@/components/task-runner/async-tasks-table';
import { toast } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { useFormHelper } from '@/ui/form-hook-helper';
import { Typography } from '@/ui/typography';

const formSchema = z.object({
  email: z.string().email(),
});

export const TaskRunner: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const { mutate: sendExportRequest, isLoading } = useExportDatabaseToCSV();

  const { formComponent } = useFormHelper(
    {
      schema: formSchema,
      fields: [
        {
          name: 'email',
          label: 'Email',
          required: true,
        },
      ],
      isLoading,
      submitContent: t('Export Database'),
      onSubmit: (values): void => {
        sendExportRequest(values, {
          onSuccess: () => {
            toast({
              title: t(`Database export complete`),
              description: t(
                `The ZIP file containing CSV exports of each table has been sent to {{email}}.`,
                { email: values.email }
              ),
            });
          },
          onError: () => {
            toast({
              title: t(`Database export failed`),
              description: t(
                `An error occurred while exporting the database. Please try again.`
              ),
            });
          },
        });
      },
    },
    { defaultValues: { email: '' } }
  );

  return (
    <div>
      <div className="mb-6">
        <Typography.H2>
          <Trans>Export Database to CSV</Trans>
        </Typography.H2>
        <Typography.Paragraph>
          <Trans>
            This task exports the entire database as CSV files, compiling them
            into a ZIP file. Once the export is complete, the ZIP file will be
            sent to the email address you specify below.
          </Trans>
          <br />
          <Trans>Enter your email to receive the export.</Trans>
        </Typography.Paragraph>
      </div>
      {formComponent}
      <AsyncTasksTable />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default TaskRunner;
