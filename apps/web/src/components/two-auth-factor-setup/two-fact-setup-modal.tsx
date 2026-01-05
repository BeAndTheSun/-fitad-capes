import {
  formatZodiosError,
  useEnable2fa,
  useSetup2fa,
} from '@meltstudio/client-common';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Input,
  useToast,
} from '@meltstudio/theme';
import { AuthErrorCode, TwoFactorProvider } from '@meltstudio/types';
import Image from 'next/image';
import { Trans, useTranslation } from 'next-i18next';
import type { Dispatch, SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';

import { useClientConfig } from '@/config/client';
import { Typography } from '@/ui/typography';

enum SetupStep {
  ConfirmPassword,
  DisplayQrCode,
  EnterTotpCode,
}

const WithStep = ({
  step,
  current,
  children,
}: {
  step: SetupStep;
  current: SetupStep;
  children: JSX.Element;
}): JSX.Element | null => {
  return step === current ? children : null;
};

const TwoFactSetupModal = ({
  isOpen,
  onOpenChange,
  onEnable,
  onClose,
}: {
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onEnable: () => void;
  onClose: () => void;
}): JSX.Element => {
  const { t } = useTranslation();
  const [dataUri, setDataUri] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(SetupStep.ConfirmPassword);
  const clientConfig = useClientConfig();

  const setup2fa = useSetup2fa();
  const enable2fa = useEnable2fa();

  const { provider } = clientConfig.twoFactorAuth;

  const resetModalState = (): void => {
    setStep(SetupStep.ConfirmPassword);
    setPassword('');
    setTotpCode('');
    setDataUri('');
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const handleClose = (): void => {
    resetModalState();
    onClose();
  };

  const handleSetup = (): void => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      setup2fa.mutate(
        {
          password,
          provider,
        },
        {
          onSuccess: (body) => {
            setDataUri(body.data);
            setStep(
              provider === TwoFactorProvider.AUTHENTICATOR
                ? SetupStep.DisplayQrCode
                : SetupStep.EnterTotpCode
            );
          },
          onError: (e) => {
            const error = formatZodiosError('setup2fa', e);
            if (error?.error === (AuthErrorCode.IncorrectPassword as string)) {
              toast({
                title: t('Incorrect Password'),
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

  function handleEnable(code: string): void {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      enable2fa.mutate(
        {
          totpCode: code,
        },
        {
          onSuccess: () => {
            toast({
              title: t('Successfully enabled 2FA'),
            });
            resetModalState();
            onEnable();
          },
          onError: (e) => {
            const error = formatZodiosError('enable2fa', e);
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <WithStep step={SetupStep.ConfirmPassword} current={step}>
          <>
            <DialogHeader>
              <Trans>Enable two-factor authentication</Trans>
            </DialogHeader>
            <Typography.Paragraph>
              <Trans>
                To enable two-factor authentication, please enter your password.
              </Trans>
            </Typography.Paragraph>
            <Input
              type="password"
              placeholder="*******"
              value={password}
              onChange={(event): void => setPassword(event.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
              <Button loading={isSubmitting} onClick={handleSetup}>
                <Trans>Continue</Trans>
              </Button>
            </DialogFooter>
          </>
        </WithStep>
        {provider === TwoFactorProvider.AUTHENTICATOR && (
          <WithStep step={SetupStep.DisplayQrCode} current={step}>
            <>
              <DialogHeader>
                <Typography.H3>
                  <Trans>Enable two-factor authentication</Trans>{' '}
                </Typography.H3>
              </DialogHeader>
              <Typography.Paragraph>
                <Trans>
                  Scan the image below with the authenticator app on your phone.
                </Trans>
              </Typography.Paragraph>
              <div className="flex w-full items-center justify-center">
                <Image src={dataUri} alt="" width={250} height={250} />
              </div>

              <DialogFooter>
                <Button onClick={handleClose}>Close</Button>
                <Button
                  loading={isSubmitting}
                  onClick={(): void => setStep(SetupStep.EnterTotpCode)}
                >
                  <Trans>Continue</Trans>
                </Button>
              </DialogFooter>
            </>
          </WithStep>
        )}
        <WithStep step={SetupStep.EnterTotpCode} current={step}>
          <>
            <DialogHeader>
              <Trans>Enable two-factor authentication</Trans>
            </DialogHeader>

            <Typography.Small>
              {provider === TwoFactorProvider.AUTHENTICATOR
                ? t('Enter the code from your authenticator app.')
                : t('Enter the code from your email.')}
            </Typography.Small>
            <input
              type="text"
              className="rounded-md border border-solid p-2 text-center text-black dark:text-white"
              maxLength={6}
              onChange={(e): void => setTotpCode(e.target.value)}
              value={totpCode}
            />

            <DialogFooter>
              <Button onClick={handleClose}>
                <Trans>Close</Trans>
              </Button>
              <Button
                loading={isSubmitting}
                onClick={(): void => handleEnable(totpCode)}
              >
                <Trans>Enable</Trans>
              </Button>
            </DialogFooter>
          </>
        </WithStep>
      </DialogContent>
    </Dialog>
  );
};

export { TwoFactSetupModal };
