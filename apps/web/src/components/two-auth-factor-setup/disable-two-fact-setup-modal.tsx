import { formatZodiosError, useDisable2fa } from '@meltstudio/client-common';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  useToast,
} from '@meltstudio/theme';
import { AuthErrorCode, TwoFactorProvider } from '@meltstudio/types';
import { Trans, useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useClientConfig } from '@/config/client';
import { Typography } from '@/ui/typography';

const DisableTwoFactSetupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDisable: () => void;
}> = ({ isOpen, onClose, onDisable }) => {
  const { t } = useTranslation();
  const [totpCode, setTotpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const clientConfig = useClientConfig();

  const { provider } = clientConfig.twoFactorAuth;

  const disable2fa = useDisable2fa();

  const handleDisable = (): void => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      disable2fa.mutate(
        {
          totpCode,
          password: '',
        },
        {
          onSuccess: () => {
            toast({
              title: t('Successfully disabled 2FA'),
            });
            onDisable();
          },
          onError: (e) => {
            const error = formatZodiosError('disable2fa', e);
            if (
              error?.error === (AuthErrorCode.IncorrectTwoFactorCode as string)
            ) {
              toast({
                title: t('Incorrect code. Please try again'),
              });
            } else {
              toast({
                title: t('Sorry something went wrong'),
              });
            }
          },
        }
      );
    } catch (e) {
      toast({
        title: t('Sorry something went wrong'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <Typography.H4>
            <Trans>Disable two-factor authentication</Trans>
          </Typography.H4>
        </DialogHeader>
        <Typography.Paragraph>
          {provider === TwoFactorProvider.AUTHENTICATOR
            ? t('Enter your code to disable 2FA')
            : t('Enter the code sent to your email to disable 2FA')}
        </Typography.Paragraph>
        <input
          type="text"
          className="rounded-md border border-solid p-2 text-center text-black dark:text-white"
          maxLength={6}
          onChange={(e): void => setTotpCode(e.target.value)}
          value={totpCode}
        />
        <DialogFooter>
          <Button onClick={onClose}>
            <Trans>Close</Trans>
          </Button>
          <Button onClick={handleDisable}>
            <Trans>Disable</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DisableTwoFactSetupModal };
