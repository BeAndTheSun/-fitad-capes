import { useGenerateVenueInvitation } from '@meltstudio/client-common';
import { Button } from '@meltstudio/theme';
import type { ApiError } from '@meltstudio/types';
import { QrModal } from '@meltstudio/ui';
import { Trans, useTranslation } from 'next-i18next';
import type { FC, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

type QrInvitationModalProps = {
  workspaceId: string;
  venueId: string;
  venueName: string;
  trigger?: ReactNode;
  downloadFileName?: string;
};

export const QrInvitationModal: FC<QrInvitationModalProps> = ({
  workspaceId,
  venueId,
  venueName,
  trigger: customTrigger,
  downloadFileName,
}) => {
  const { t } = useTranslation();
  const generateMutation = useGenerateVenueInvitation();

  const invitationUrl = useMemo(
    () => generateMutation.data?.invitationUrl || null,
    [generateMutation.data?.invitationUrl]
  );

  const generateUrl = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      generateMutation.mutate(
        { workspaceId, venueId },
        {
          onSuccess: (data) => {
            resolve(data.invitationUrl);
          },
          onError: (err: unknown) => {
            const error = err as ApiError;

            if (error?.response?.status === 403) {
              reject(
                new Error(t('Cannot generate QR code for inactive venue'))
              );
            } else {
              reject(error);
            }
          },
        }
      );
    });
  }, [generateMutation, workspaceId, venueId, t]);

  const defaultTrigger = useMemo(
    () => (
      <Button variant="outline" size="sm">
        <Trans>Generate QR Code</Trans>
      </Button>
    ),
    []
  );

  return (
    <QrModal
      url={invitationUrl}
      generateUrl={generateUrl}
      title={<Trans>Venue Invitation</Trans>}
      description={
        <>
          <Trans>Scan this QR code to join the venue</Trans>: {venueName}
        </>
      }
      urlLabel={t('Invitation Link')}
      trigger={customTrigger ?? defaultTrigger}
      qrCodeAlt={t('QR Code for venue invitation')}
      downloadFileName={downloadFileName}
    />
  );
};
