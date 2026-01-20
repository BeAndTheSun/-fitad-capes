/* eslint-disable import/no-extraneous-dependencies */
import {
  useGenerateVenueCheckIn,
  useGenerateVenueInvitation,
} from '@meltstudio/client-common';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  useToast,
} from '@meltstudio/theme';
import { QRCode } from '@meltstudio/ui';
import {
  Check,
  Copy,
  Download,
  QrCode as QrCodeIcon,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { DbVenue } from '@/db/schema';

type CheckInTabProps = {
  venue: DbVenue;
  workspaceId: string;
  onRefetch: () => void;
};

export const CheckInTab: FC<CheckInTabProps> = ({
  venue,
  workspaceId,
  onRefetch,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [origin, setOrigin] = useState('');

  const generateCheckIn = useGenerateVenueCheckIn();
  const generateInvitation = useGenerateVenueInvitation();

  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedCheckIn, setCopiedCheckIn] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const checkInUrl = venue.checking_token
    ? `${origin}/venues/check-in/${venue.checking_token}`
    : '';

  const inviteUrl = venue.invitation_token
    ? `${origin}/venues/invitation/${venue.invitation_token}?workspaceId=${workspaceId}`
    : '';

  const checkInQrRef = useRef<HTMLDivElement>(null);
  const inviteQrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQrCode = (
    ref: React.RefObject<HTMLDivElement>,
    filename: string
  ): void => {
    const img = ref.current?.querySelector('img');
    if (img?.src) {
      const link = document.createElement('a');
      link.href = img.src;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerateCheckIn = (): void => {
    generateCheckIn.mutate(
      { workspaceId, venueId: venue.id },
      {
        onSuccess: () => {
          toast({
            title: t('Check-in QR Code generated'),
            description: t('The check-in QR code is now available'),
          });
          onRefetch();
        },
        onError: () => {
          toast({
            title: t('Error'),
            description: t('Failed to generate check-in QR code'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleGenerateInvitation = (): void => {
    generateInvitation.mutate(
      { workspaceId, venueId: venue.id },
      {
        onSuccess: () => {
          toast({
            title: t('Invitation Link generated'),
            description: t('The invitation link is now available'),
          });
          onRefetch();
        },
        onError: () => {
          toast({
            title: t('Error'),
            description: t('Failed to generate invitation link'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const copyToClipboard = (
    text: string,
    setCopied: (v: boolean) => void
  ): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: t('Copied to clipboard'),
        });
      })
      .catch(() => {
        toast({
          title: t('Failed to copy'),
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCodeIcon className="size-5" />
            {t('Check-In QR Code')}
          </CardTitle>
          <CardDescription>
            {t(
              'Participants can scan this QR code to check in to the venue event.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!venue.checking_token ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <p className="text-sm text-muted-foreground">
                {t('No check-in QR code generated yet.')}
              </p>
              <Button
                onClick={handleGenerateCheckIn}
                disabled={generateCheckIn.isLoading}
              >
                {generateCheckIn.isLoading && (
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                )}
                {t('Generate QR Code')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 md:flex-row md:space-x-8 md:space-y-0">
              <div
                ref={checkInQrRef}
                className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-4 shadow-sm"
              >
                <div
                  style={{
                    height: 'auto',
                    margin: '0 auto',
                    maxWidth: 200,
                    width: '100%',
                  }}
                >
                  <QRCode
                    size={256}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    value={checkInUrl}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    handleDownloadQrCode(checkInQrRef, 'check-in-qr')
                  }
                >
                  <Download className="mr-2 size-4" />
                  {t('Save QR Code')}
                </Button>
              </div>
              <div className="flex flex-1 flex-col space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('Check-In URL')}
                  </label>
                  <div className="flex space-x-2">
                    <Input readOnly value={checkInUrl} />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(checkInUrl, setCopiedCheckIn)
                      }
                    >
                      {copiedCheckIn ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    {t(
                      'You can also share this URL directly with participants.'
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateCheckIn}
                    disabled={generateCheckIn.isLoading}
                  >
                    <RefreshCw
                      className={`mr-2 size-4 ${
                        generateCheckIn.isLoading ? 'animate-spin' : ''
                      }`}
                    />
                    {t('Regenerate QR Code')}
                  </Button>
                  <p className="text-[0.8rem] text-yellow-600">
                    {t(
                      'Warning: Regenerating will invalidate the previous QR code.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            {t('Invitation QR Code')}
          </CardTitle>
          <CardDescription>
            {t('Scan this QR code to invite new participants to this venue.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!venue.invitation_token ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <p className="text-sm text-muted-foreground">
                {t('No invitation link generated yet.')}
              </p>
              <Button
                onClick={handleGenerateInvitation}
                disabled={generateInvitation.isLoading}
              >
                {generateInvitation.isLoading && (
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                )}
                {t('Generate Invite QRCode')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 md:flex-row md:space-x-8 md:space-y-0">
              <div
                ref={inviteQrRef}
                className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-4 shadow-sm"
              >
                <div
                  style={{
                    height: 'auto',
                    margin: '0 auto',
                    maxWidth: 200,
                    width: '100%',
                  }}
                >
                  <QRCode
                    size={256}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    value={inviteUrl}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    handleDownloadQrCode(inviteQrRef, 'invitation-qr')
                  }
                >
                  <Download className="mr-2 size-4" />
                  {t('Save QR Code')}
                </Button>
              </div>
              <div className="flex flex-1 flex-col space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('Invitation URL')}
                  </label>
                  <div className="flex space-x-2">
                    <Input readOnly value={inviteUrl} />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(inviteUrl, setCopiedInvite)
                      }
                    >
                      {copiedInvite ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    {t('Share this link to invite new participants.')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateInvitation}
                    disabled={generateInvitation.isLoading}
                  >
                    <RefreshCw
                      className={`mr-2 size-4 ${
                        generateInvitation.isLoading ? 'animate-spin' : ''
                      }`}
                    />
                    {t('Regenerate Link')}
                  </Button>
                  <p className="text-[0.8rem] text-yellow-600">
                    {t(
                      'Warning: Regenerating will invalidate the previous invitation link.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
