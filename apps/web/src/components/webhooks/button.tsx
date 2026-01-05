import { Trans } from 'next-i18next';
import React, { useState } from 'react';

import { Button } from '@/theme/index';

import { AddWebhookUrlDialog } from './dialog';

export type AddWebhookUrlButtonProps = {
  className?: string;
};

export const AddWebhookUrlButton: React.FC<AddWebhookUrlButtonProps> = ({
  className,
}) => {
  const [openAddWebhookUrl, setOpenAddWebhookUrl] = useState(false);
  const onClickAddWebhook = (): void => {
    setOpenAddWebhookUrl(true);
  };
  return (
    <>
      <Button className={className} onClick={onClickAddWebhook}>
        <Trans>Add Webhook Url</Trans>
      </Button>
      <AddWebhookUrlDialog
        open={openAddWebhookUrl}
        onOpenChange={setOpenAddWebhookUrl}
      />
    </>
  );
};
