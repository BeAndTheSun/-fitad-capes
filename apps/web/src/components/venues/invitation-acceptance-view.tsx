import {
  useAcceptVenueInvitation,
  useValidateVenueInvitation,
} from '@meltstudio/client-common';
import { InvitationAcceptanceView } from '@meltstudio/ui';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useCallback } from 'react';

type InvitationAcceptanceViewProps = {
  token: string;
  workspaceId: string;
};

export const VenueInvitationAcceptanceView: FC<
  InvitationAcceptanceViewProps
> = ({ token, workspaceId }) => {
  const router = useRouter();

  const { data, isLoading, error } = useValidateVenueInvitation(
    token,
    workspaceId
  );
  const acceptMutation = useAcceptVenueInvitation();

  const handleAccept = useCallback(
    async (params: { token: string; workspaceId: string }) => {
      await acceptMutation.mutateAsync(params);
      // Redirect to my-venues
      await router.push('/my-venues');
    },
    [acceptMutation, router]
  );

  const handleReject = useCallback(async () => {
    // Redirect to home
    await router.push('/');
  }, [router]);

  return (
    <InvitationAcceptanceView
      token={token}
      workspaceId={workspaceId}
      validationData={data}
      isValidating={isLoading}
      validationError={error}
      onAccept={handleAccept}
      onReject={handleReject}
      isAccepting={acceptMutation.isLoading}
      acceptError={acceptMutation.error}
    />
  );
};
