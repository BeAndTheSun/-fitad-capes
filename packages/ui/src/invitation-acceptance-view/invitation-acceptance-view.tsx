import { Button, Card, CardContent, CardHeader } from '@meltstudio/theme';
import { Briefcase, Building2, MapPin, User } from 'lucide-react';
import { Trans } from 'next-i18next';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

export type VenueInvitationData = {
  venue: {
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
  };
  trainer: {
    id: string;
    name: string;
    email: string;
  } | null;
  workspace?: {
    id: string;
    name: string;
  } | null;
};

export type InvitationAcceptanceViewProps = {
  /**
   * Invitation token
   */
  token: string;
  /**
   * Workspace ID
   */
  workspaceId: string;
  /**
   * Validation data from the API
   */
  validationData?: VenueInvitationData | null;
  /**
   * Whether validation is loading
   */
  isValidating?: boolean;
  /**
   * Validation error
   */
  validationError?: Error | null;
  /**
   * Function to accept the invitation
   * Should return a Promise that resolves when the invitation is accepted
   */
  onAccept: (params: { token: string; workspaceId: string }) => Promise<void>;
  /**
   * Function to reject the invitation
   * Should return a Promise that resolves when the invitation is rejected
   */
  onReject: () => Promise<void>;
  /**
   * Whether the accept mutation is loading
   */
  isAccepting?: boolean;
  /**
   * Error from the accept mutation
   */
  acceptError?: Error | null;
};

export const InvitationAcceptanceView: FC<InvitationAcceptanceViewProps> = ({
  token,
  workspaceId,
  validationData,
  isValidating = false,
  validationError,
  onAccept,
  onReject,
  isAccepting = false,
  acceptError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onAccept({ token, workspaceId });
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      // Error will be shown in the UI via acceptError prop
    }
  }, [token, workspaceId, onAccept]);

  const handleReject = useCallback(async () => {
    await onReject();
  }, [onReject]);

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
              <Trans>Invalid invitation</Trans>
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <Trans>This invitation link is invalid or has expired</Trans>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if there's an error from the accept mutation
  const acceptErrorObj = acceptError as
    | { response?: { data?: { error?: string } } }
    | undefined;
  const errorMessage = acceptErrorObj?.response?.data?.error;

  // Check for specific error conditions
  const isAlreadyMember = errorMessage?.includes('already a member');
  const isAccessDenied = errorMessage?.includes('not in workspace');

  if (isAlreadyMember) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-bold">
              <Trans>Already a member</Trans>
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <Trans>You are already a member of this venue</Trans>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAccessDenied) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <h2 className="text-2xl font-bold text-destructive">
              <Trans>Access Denied</Trans>
            </h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">
              <Trans>You do not belong to this workspace</Trans>
            </p>
            <p className="text-sm text-muted-foreground">
              <Trans>Please contact the workspace administrator</Trans>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { venue, trainer } = validationData;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h1 className="text-3xl font-bold">
            <Trans>You have been invited to join</Trans>
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Venue Details */}
          <div className="space-y-4">
            {/* Workspace */}
            {validationData.workspace && (
              <div className="flex items-start gap-3">
                <Briefcase className="mt-1 size-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <Trans>Workspace</Trans>
                  </div>
                  <div className="text-base font-semibold">
                    {validationData.workspace.name}
                  </div>
                </div>
              </div>
            )}

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

            {/* Trainer Info */}
            {trainer && (
              <div className="flex items-start gap-3">
                <User className="mt-1 size-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <Trans>Trainer</Trans>
                  </div>
                  <div className="mt-1 text-base font-semibold">
                    {trainer.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trainer.email}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {acceptError && !isAlreadyMember && !isAccessDenied && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage || <Trans>Failed to accept invitation</Trans>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              disabled={isProcessing || isAccepting}
              className="flex-1"
            >
              {isProcessing || isAccepting ? (
                <Trans>Processing</Trans>
              ) : (
                <Trans>Accept Invitation</Trans>
              )}
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              disabled={isProcessing}
              className="flex-1"
            >
              <Trans>Reject Invitation</Trans>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
