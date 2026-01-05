import {
  formatZodiosError,
  useListIntegrationKeys,
  useSaveIntegrationKeys,
} from '@meltstudio/client-common';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { z } from 'zod';

import type { IntegrationsKeys } from '@/common-types/site-integrations';
import { useSessionUser } from '@/components/user/user-context';
import { Spinner, toast } from '@/theme/index';
import { useFormHelper } from '@/ui/form-hook-helper';

export type UserPropsForUpdateRole = {
  id: string;
  name: string;
};

export type IntegrationSetupFormProps = {
  platformId: IntegrationsKeys;
  fields: {
    label: string;
    name: string;
  }[];
  onCloseDialog: () => void;
};

export const IntegrationSetupForm: React.FC<IntegrationSetupFormProps> = ({
  platformId,
  fields,
  onCloseDialog,
}) => {
  const { t } = useTranslation();
  const { selectedWorkspace } = useSessionUser();
  const fieldsInSchema = fields.reduce<
    Record<string, z.ZodType<string | null | undefined>>
  >((acc, field) => {
    acc[field.name] = z.string().nullish();
    return acc;
  }, {});

  const {
    data: integrationData,
    isLoading: integrationDataIsLoading,
    invalidate: invalidateIntegrationData,
  } = useListIntegrationKeys(
    {
      params: {
        workspaceId: selectedWorkspace?.id || '',
        platform: platformId,
      },
    },
    { refetchOnReconnect: false, refetchOnWindowFocus: false }
  );

  const integrationKeysAsRecord =
    integrationData?.integrationKeys.reduce<Record<string, string>>(
      (acc, key) => {
        acc[key.keyName] = key.value;
        return acc;
      },
      {}
    ) || {};

  const {
    mutate: saveIntegrationKeys,
    isLoading: isLoadingSaveIntegrationKeys,
  } = useSaveIntegrationKeys(
    {
      workspaceId: selectedWorkspace?.id || '',
      platform: platformId,
    },
    {
      onSuccess: async () => {
        toast({ title: t('Changes saved!') });
        onCloseDialog();
        await invalidateIntegrationData();
      },
      onError: (zodiosError) => {
        const e = formatZodiosError('saveIntegrationKeys', zodiosError);
        let message = t('There was an error saving the keys');
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

  const schema = z
    .object({
      enabled: z.boolean(),
      keys: z.object(fieldsInSchema),
    })
    .superRefine((value, ctx) => {
      fields.forEach((field) => {
        if (value.enabled && !value.keys[field.name]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(`The {{label}} is required`, { label: field.label }),
            path: ['keys', field.name],
          });
        }
      });
    });

  const { formComponent } = useFormHelper(
    {
      schema,
      fields: [
        {
          label: t('Enabled'),
          name: 'enabled',
          type: 'checkbox',
          checkboxMode: 'boolean',
          required: true,
        },
        ...fields.map((field) => ({
          label: field.label,
          name: `keys.${field.name}` satisfies `keys.${string}`,
          type: 'text' as const,
          required: true,
        })),
      ],
      onSubmit: (submitData) => {
        const keysAsList = Object.entries(submitData.keys).map(
          ([keyName, keyValue]) => ({ name: keyName, value: keyValue || '' })
        );
        saveIntegrationKeys({ ...submitData, keys: keysAsList });
      },
      isLoading: isLoadingSaveIntegrationKeys,
    },
    {
      values: {
        enabled: integrationData?.enabled || false,
        keys: integrationKeysAsRecord,
      } as (typeof schema)['_input'],
    }
  );

  return (
    <div>
      {integrationDataIsLoading ? <Spinner size="medium" /> : formComponent}
    </div>
  );
};
