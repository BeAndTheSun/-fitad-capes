import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import { z } from 'zod';

import { useCreateWebhook } from '@/client-common/sdk';
import { useSessionUser } from '@/components/user/user-context';
import { toast } from '@/theme/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/theme/index';
import { useFormHelper } from '@/ui/form-hook-helper';

export type AddWebhookUrlDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const AddWebhookUrlDialog: React.FC<AddWebhookUrlDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate } = useCreateWebhook();
  const { selectedWorkspace } = useSessionUser();
  const reportFormSchema = z.object({
    name: z.string().min(1, { message: t('Name is required') }),
    url: z
      .string()
      .url({ message: t('Must be a valid URL') })
      .min(1, { message: t('URL is required') }),
    eventTypes: z.array(z.string()).min(1, {
      message: t('At least one event type is required'),
    }),
  });

  const { formComponent } = useFormHelper(
    {
      schema: reportFormSchema,
      fields: [
        {
          name: 'name',
          label: t('Name'),
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: t('Link URL'),
          required: true,
        },
        {
          name: 'eventTypes',
          label: t('Event Types'),
          type: 'checkbox',
          options: [
            { value: 'reports_create', label: t('Report Created') },
            { value: 'reports_update', label: t('Report Updated') },
            { value: 'reports_delete', label: t('Report Deleted') },
            {
              value: 'user_workspaces_create',
              label: t('Member Added to Workspace'),
            },
            {
              value: 'user_workspaces_update',
              label: t('Member Updated in Workspace'),
            },
            {
              value: 'user_workspaces_delete',
              label: t('Member Removed from Workspace'),
            },
            {
              value: 'member_invitations_create',
              label: t('Member Invitation Sent'),
            },
            {
              value: 'member_invitations_update',
              label: t('Member Invitation Updated'),
            },
            {
              value: 'member_invitations_delete',
              label: t('Member Invitation Deleted'),
            },
          ],
          required: true,
        },
      ],
      onSubmit: (values) => {
        mutate(
          {
            ...values,
            workspaceId: selectedWorkspace?.id || '',
          },
          {
            onSuccess: () => {
              toast({
                title: t('Success'),
                description: t('Webhook created successfully'),
                variant: 'default',
              });
              onOpenChange?.(false);
              // eslint-disable-next-line no-void
              void router.push('/webhooks');
            },
            onError: () => {
              toast({
                title: t('Error'),
                description: t('An error occurred'),
                variant: 'destructive',
              });
            },
          }
        );
      },
    },
    {
      defaultValues: {},
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <Trans>Add Webhook Url</Trans>
        </DialogTitle>
        <div className="mb-6 flex items-center justify-between">
          {formComponent}
        </div>
      </DialogContent>
    </Dialog>
  );
};
