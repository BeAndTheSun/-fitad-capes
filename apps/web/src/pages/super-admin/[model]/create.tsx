import { formatZodiosError, useCreateRecord } from '@meltstudio/client-common';
import { useToast } from '@meltstudio/theme';
import {
  addMinLengthValidationToRequiredStrings,
  useFormHelper,
} from '@meltstudio/ui';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { z } from 'zod';

import { ErrorMessageBox } from '@/components/error-message-box';
import type { ModelConfigData } from '@/config/super-admin';
import { useModelByRoute } from '@/hooks/use-model-by-route';
import { useRelationsByModel } from '@/hooks/use-relations-by-model';
import type { NextPageWithLayout } from '@/types/next';
import { buildRecordRequest } from '@/utils/build-record-request';

/**
 * Returns an object with sensible default values for any given schema
 * If the zod property has a .default() value, it will use it (only for individual properties, not for the whole schema)
 * Note: nested fields are not supported
 */
function getDefaults<Schema extends z.AnyZodObject>(
  schema: Schema
): Record<string, string | number | boolean | undefined> {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) {
        // eslint-disable-next-line no-underscore-dangle
        return [key, value._def.defaultValue()];
      }
      if (value instanceof z.ZodString) {
        return [key, ''];
      }
      if (value instanceof z.ZodNumber) {
        return [key, 0];
      }
      if (value instanceof z.ZodBoolean) {
        return [key, false];
      }
      return [key, undefined];
    })
  );
}

type AdminRecordComponentProps = {
  model: ModelConfigData;
  modelName: string;
};
const AdminRecordComponent: React.FC<AdminRecordComponentProps> = ({
  model,
  modelName,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Setup the update mutation
  const createRecord = useCreateRecord({
    params: { model: modelName },
  });

  const { toast } = useToast();

  const formFieldsWithRelations = useRelationsByModel(model);

  const { formComponent } = useFormHelper(
    {
      schema: addMinLengthValidationToRequiredStrings(model.schema),
      fields: formFieldsWithRelations,
      isLoading: createRecord.isLoading,
      submitContent: t('Create'),
      onSubmit: (values) => {
        const { data, relations } = buildRecordRequest(model, values);
        createRecord.mutate(
          {
            data,
            relations,
          },
          {
            onSuccess: async () => {
              toast({
                title: t('Record created'),
              });
              await router.push(`/super-admin/${model.url}`);
            },
            onError: (zodiosError) => {
              const e = formatZodiosError('createRecord', zodiosError, {
                method: 'post',
                path: `/api/admin/:model`,
              });
              let message = t('There was an error creating the record');
              let description = '';
              if (e) {
                message = e.error;
                description = JSON.stringify(e.validationErrors);
              }
              toast({
                title: message,
                description,
              });
            },
          }
        );
      },
    },
    { defaultValues: getDefaults(model.schema) }
  );

  // Render the form with the update option
  return (
    <div
      style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd' }}
    >
      <h2>
        <Trans>Create Record</Trans>
      </h2>
      {formComponent}
    </div>
  );
};

const AdminRecordPage: NextPageWithLayout = () => {
  const { model, modelName, isReady } = useModelByRoute();

  if (!isReady) {
    return null;
  }

  if (!model) {
    return <ErrorMessageBox error="Model not found" />;
  }

  return <AdminRecordComponent model={model} modelName={modelName} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default AdminRecordPage;
