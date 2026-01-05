import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import type { IntegrationsKeys } from '@/common-types/site-integrations';
import { Button } from '@/theme/index';

import { IntegrationDialog } from './dialog';

export type IntegrationRowProps = {
  platformId: IntegrationsKeys;
  platformName: string;
};

export const IntegrationRow: React.FC<IntegrationRowProps> = ({
  platformId,
  platformName,
}) => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <div className="my-2 flex items-center gap-4">
      <span>{platformName}</span>
      <Button
        className="ml-auto"
        onClick={(): void => setOpenDialog(true)}
        disabled
      >
        {t('Coming soon')}
      </Button>
      <IntegrationDialog
        platformId={platformId}
        platformName={platformName}
        open={openDialog}
        onOpenChange={setOpenDialog}
      />
    </div>
  );
};
