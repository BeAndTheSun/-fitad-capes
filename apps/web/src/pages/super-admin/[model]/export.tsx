import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/navigation';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { z } from 'zod';

import { useExportModelToCSV } from '@/client-common/sdk';
import { AsyncTasksByModelTable } from '@/components/task-runner/async-tasks-by-model-table';
import { modelsConfig } from '@/config/super-admin';
import type { DbModelKeys } from '@/db/models/db';
import { useModelByRoute } from '@/hooks/use-model-by-route';
import { toast } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { useFormHelper } from '@/ui/form-hook-helper';
import { Typography } from '@/ui/typography';

const formSchema = z.object({
  email: z.string().email(),
});

const AdminModelExportPage: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { model, modelName } = useModelByRoute();
  const [email, setEmail] = useState<string>('');
  const { mutate: exportToCSV, isLoading } = useExportModelToCSV(
    modelName,
    email
  );

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
      submitContent: t('Initiate a new export'),
      onSubmit: (values): void => {
        setEmail(values.email);
        exportToCSV(values, {
          onSuccess: () => {
            toast({
              title: t(`Database export complete`),
              description: t(
                'The ZIP file containing CSV exports of {{modelName}} has been sent to {{email}}.',
                { modelName, email: values.email }
              ),
            });
          },
          onError: () => {
            toast({
              title: t(`Database export failed`),
              description: t(
                'An error occurred while exporting the model. Please try again'
              ),
            });
          },
        });
      },
    },
    { defaultValues: { email: '' } }
  );

  const dbModelName = modelName as DbModelKeys;

  if (!model || !modelsConfig[modelName]) {
    return (
      <div>
        <Trans>Model not found</Trans>
      </div>
    );
  }

  if (!model.isExportable) {
    router.push(`/super-admin/${model.url}`);
  }
  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <Typography.H2>
          Exports from {modelsConfig[modelName]?.displayName || t('Model')}
        </Typography.H2>
      </div>
      {formComponent}
      <AsyncTasksByModelTable modelName={dbModelName} />
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

export default AdminModelExportPage;
