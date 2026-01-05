import { useSenTwoFactorAuthEmail } from '@meltstudio/client-common';
import { Switch, toast } from '@meltstudio/theme';
import { Trans, useTranslation } from 'next-i18next';
import { useState } from 'react';

import { DisableTwoFactSetupModal } from './disable-two-fact-setup-modal';
import { TwoFactSetupModal } from './two-fact-setup-modal';

const TwoFactSettings: React.FC<{ is2faEnabled: boolean }> = ({
  is2faEnabled,
}) => {
  const { t } = useTranslation();
  const [isOpenSetupModal, setIsOpenSetupModal] = useState(false);
  const onOpenSetupModal = (): void => setIsOpenSetupModal(true);
  const onCloseSetupModal = (): void => setIsOpenSetupModal(false);
  const [isOpenDisableModal, setIsOpenDisableModal] = useState(false);
  const onCloseDisableModal = (): void => setIsOpenDisableModal(false);
  const [isEnabled, setEnabled] = useState<boolean>(is2faEnabled);

  const sendTwoFactorEmail = useSenTwoFactorAuthEmail();

  const handleOnEnable = (): void => {
    setEnabled(true);
    onCloseSetupModal();
  };

  const handleOnDisable = (): void => {
    setEnabled(false);
    onCloseDisableModal();
  };

  const onOpenDisableModal = (): void => {
    sendTwoFactorEmail.mutate(undefined, {
      onSuccess: () => {
        setIsOpenDisableModal(true);
      },
      onError: () => {
        toast({
          title: t('Error'),
          description: t('Failed to send two factor authentication email'),
        });
      },
    });
  };

  return (
    <>
      <div className="flex w-full gap-6">
        <label className="pr-4" htmlFor="two-factor">
          <Trans>Enable two-factor authentication</Trans>
        </label>
        <Switch
          id="two-factor"
          checked={isEnabled}
          onCheckedChange={(): void => {
            if (isEnabled) {
              onOpenDisableModal();
            } else {
              onOpenSetupModal();
            }
          }}
        />
      </div>
      <TwoFactSetupModal
        isOpen={isOpenSetupModal}
        onOpenChange={setIsOpenSetupModal}
        onEnable={handleOnEnable}
        onClose={onCloseSetupModal}
      />
      <DisableTwoFactSetupModal
        isOpen={isOpenDisableModal}
        onClose={onCloseDisableModal}
        onDisable={handleOnDisable}
      />
    </>
  );
};

export { TwoFactSettings };
