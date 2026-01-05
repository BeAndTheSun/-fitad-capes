import { useTranslation } from 'next-i18next';
import React from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/theme/index';

import { WebhookEventsTable } from './webhook-events-table';

export type WebhookEventsDialogProps = {
  open: boolean;
  webhookId: string;
  onOpenChange?: (open: boolean) => void;
};

export const WebhookEventsDialog: React.FC<WebhookEventsDialogProps> = ({
  open,
  webhookId,
  onOpenChange,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>{t('Webhook Events')}</DialogTitle>
        <WebhookEventsTable webhookId={webhookId} />
      </DialogContent>
    </Dialog>
  );
};
