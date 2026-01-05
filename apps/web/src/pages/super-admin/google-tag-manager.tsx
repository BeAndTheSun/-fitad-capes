import { formatZodiosError, useUpdateGTMId } from '@meltstudio/client-common';
import { useToast } from '@meltstudio/theme';
import { useFormHelper } from '@meltstudio/ui';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';

import { useSessionUser } from '@/components/user/user-context';
import type { NextPageWithLayout } from '@/types/next';

const tagManagerSchema = z.object({
  gtmId: z.string().min(1),
});

const GoogleTagManagerPage: NextPageWithLayout = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const updateGTMId = useUpdateGTMId();
  const { user } = useSessionUser();

  const { formComponent, form } = useFormHelper(
    {
      schema: tagManagerSchema,
      fields: [
        {
          name: 'gtmId',
          type: 'text',
          label: t('GTM'),
          size: 'half',
          required: true,
        },
      ],
      onSubmit: () => {
        updateGTMId.mutate(
          {
            gtmId: form.getValues().gtmId,
          },
          {
            onSuccess() {
              toast({
                title: t('Record updated!'),
              });
            },
            onError(zodiosError) {
              const e = formatZodiosError('updateGTMId', zodiosError, {
                method: 'post',
                path: '/api/admin/updateGTMId',
              });
              let message =
                'There was an error updating the google tag manager Id';
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
      customSubmit: false,
    },
    {
      defaultValues: {
        gtmId: user?.gtmId ?? '',
      },
    }
  );

  return (
    <>
      <div>{t('Google tag manager')}</div>
      <div className="mt-4">{formComponent}</div>
    </>
  );
};

export default GoogleTagManagerPage;
