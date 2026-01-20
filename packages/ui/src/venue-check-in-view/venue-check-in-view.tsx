import { Button, Card, CardContent, CardHeader } from '@meltstudio/theme';
import { Building2, CheckCircle2, MapPin, User, XCircle } from 'lucide-react';
import { Trans } from 'next-i18next';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

export type VenueCheckInData = {
  venue?: {
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    owner?: {
      id: string;
      name: string;
      email?: string;
    } | null;
  };
  isActive: boolean;
  userStatus: string | null;
  canCheckIn: boolean;
  errorMessage?: string;
};

export type VenueCheckInViewProps = {
  /**
   * Check-in token
   */
  token: string;
  /**
   * Validation data from the API
   */
  validationData?: VenueCheckInData | null;
  /**
   * Whether validation is loading
   */
  isValidating?: boolean;
  /**
   * Validation error
   */
  validationError?: Error | null;
  /**
   * Function to perform the check-in
   */
  onCheckIn: (params: { token: string }) => Promise<void>;
  /**
   * Function to cancel/go back
   */
  onCancel: () => void;
  /**
   * Whether the check-in mutation is loading
   */
  isCheckingIn?: boolean;
  /**
   * Error from the check-in mutation
   */
  checkInError?: Error | null;
};

export const VenueCheckInView: FC<VenueCheckInViewProps> = ({
  token,
  validationData,
  isValidating = false,
  validationError,
  onCheckIn,
  onCancel,
  isCheckingIn = false,
  checkInError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckIn = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onCheckIn({ token });
    } catch (err) {
      setIsProcessing(false);
      // Error will be shown in the UI via checkInError prop
    } finally {
      setIsProcessing(false);
    }
  }, [token, onCheckIn]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">
          <Trans>Loading</Trans>...
        </div>
      </div>
    );
  }

  if (validationError || !validationData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-bold text-destructive">
              <Trans>Invalid check-in code</Trans>
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <Trans>This check-in link is invalid or has expired</Trans>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { venue, canCheckIn, errorMessage } = validationData;

  // Check for specific error conditions
  const checkInErrorObj = checkInError as
    | { response?: { data?: { error?: string } } }
    | undefined;
  const apiErrorMessage = checkInErrorObj?.response?.data?.error;

  // Error state - cannot check in
  if (!canCheckIn && errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="size-8 text-destructive" />
              <h2 className="text-2xl font-bold text-destructive">
                <Trans>Cannot Check In</Trans>
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">{errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we don't have venue data, show error
  if (!venue) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-bold text-destructive">
              <Trans>Invalid check-in code</Trans>
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <Trans>Unable to load venue information</Trans>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - already checked in
  if (validationData.userStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 text-green-500" />
              <h2 className="text-2xl font-bold">
                <Trans>Already Checked In</Trans>
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <Trans>You have already checked in to</Trans>{' '}
              <strong>{venue.name}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h1 className="text-3xl font-bold">
            <Trans>Check In to Venue</Trans>
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Venue Details */}
          <div className="space-y-4">
            {/* Venue Name */}
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 size-6 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <Trans>Venue</Trans>
                </div>
                <h2 className="text-2xl font-semibold">{venue.name}</h2>
              </div>
            </div>

            {/* Description */}
            {venue.description && (
              <div className="flex items-start gap-3">
                <div className="mt-1 size-5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <Trans>Description</Trans>
                  </div>
                  <p className="mt-1 text-base text-foreground">
                    {venue.description}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            {(venue.city || venue.country || venue.address) && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 size-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <Trans>Location</Trans>
                  </div>
                  <div className="mt-1 text-base text-foreground">
                    {venue.address && <div>{venue.address}</div>}
                    {(venue.city || venue.country) && (
                      <div>
                        {venue.city}
                        {venue.city && venue.country && ', '}
                        {venue.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Trainer/Owner Info */}
            {venue.owner && (
              <div className="flex items-start gap-3">
                <User className="mt-1 size-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <Trans>Trainer</Trans>
                  </div>
                  <div className="mt-1 text-base font-semibold">
                    {venue.owner.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {venue.owner.email}
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            {!validationData.isActive && (
              <div className="rounded-md bg-yellow-500/10 p-3">
                <p className="text-sm font-medium text-yellow-600">
                  <Trans>This venue is not currently active</Trans>
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {(checkInError || apiErrorMessage) && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {apiErrorMessage || <Trans>Failed to check in</Trans>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={isProcessing || isCheckingIn || !canCheckIn}
              className="flex-1"
            >
              {isProcessing || isCheckingIn ? (
                <Trans>Checking In</Trans>
              ) : (
                <Trans>Check In</Trans>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isProcessing}
              className="flex-1"
            >
              <Trans>Cancel</Trans>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
