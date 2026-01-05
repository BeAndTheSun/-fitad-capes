import { useTranslation } from 'next-i18next';
import React from 'react';

import type { IntegrationsKeys } from '@/common-types/site-integrations';
import { useIntegrationKeysByPlatform } from '@/hooks/use-integration-keys-by-platform';
import { Dialog, DialogContent, DialogTitle } from '@/theme/index';

import { IntegrationSetupForm } from './setup-form';

export type IntegrationDialogProps = {
  platformId: IntegrationsKeys;
  platformName: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const IntegrationDialog: React.FC<IntegrationDialogProps> = ({
  platformId,
  platformName,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const integrationKeysByPlatform = useIntegrationKeysByPlatform();
  const resolveDialogContent = (): React.ReactNode => {
    if (platformId in integrationKeysByPlatform) {
      return (
        <IntegrationSetupForm
          platformId={platformId}
          fields={integrationKeysByPlatform[platformId]}
          onCloseDialog={(): void => onOpenChange?.(false)}
        />
      );
    }
    throw new Error(
      `Unknown integration ${platformId}, cannot load the dialog`
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {t('Setup {{platformName}} integration', { platformName })}
        </DialogTitle>
        {resolveDialogContent()}
      </DialogContent>
    </Dialog>
  );
};
