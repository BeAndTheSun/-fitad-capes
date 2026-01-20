import { useGenerateVenueCheckIn } from '@meltstudio/client-common';
import { Button } from '@meltstudio/theme';
import { QrModal } from '@meltstudio/ui';
import { Trans, useTranslation } from 'next-i18next';
import type { FC, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

type QrCheckInModalProps = {
  workspaceId: string;
  venueId: string;
  venueName: string;
  trigger?: ReactNode;
};

export const QrCheckInModal: FC<QrCheckInModalProps> = ({
  workspaceId,
  venueId,
  venueName,
  trigger: customTrigger,
}) => {
  const { t } = useTranslation();
  const generateMutation = useGenerateVenueCheckIn();

  const checkInUrl = useMemo(
    () => generateMutation.data?.checkInUrl || null,
    [generateMutation.data?.checkInUrl]
  );

  const generateUrl = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      generateMutation.mutate(
        { workspaceId, venueId },
        {
          onSuccess: (data) => {
            resolve(data.checkInUrl);
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  }, [generateMutation, workspaceId, venueId]);

  const defaultTrigger = useMemo(
    () => (
      <Button variant="outline" size="sm">
        <Trans>Generate Check-in QR</Trans>
      </Button>
    ),
    []
  );

  return (
    <QrModal
      url={checkInUrl}
      generateUrl={generateUrl}
      title={<Trans>Venue Check-in</Trans>}
      description={
        <>
          <Trans>Scan this QR code to check in to</Trans>: {venueName}
        </>
      }
      urlLabel={t('Check-in Link')}
      trigger={customTrigger ?? defaultTrigger}
      qrCodeAlt={t('QR Code for venue check-in')}
    />
  );
};
