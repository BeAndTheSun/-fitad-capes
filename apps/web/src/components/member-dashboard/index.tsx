import {
  formatZodiosError,
  useGetMemberParticipation,
  useGetWorkspaceTrainer,
} from '@meltstudio/client-common';
import { Skeleton } from '@meltstudio/theme';
import { Typography } from '@meltstudio/ui';
import { Trans } from 'next-i18next';
import type { FC } from 'react';

import { useSessionUser } from '@/components/user/user-context';

import { ParticipationInfoCard } from './participation-info-card';
import { TrainerInfoCard } from './trainer-info-card';

type MemberDashboardProps = {
  workspaceId: string;
};

export const MemberDashboard: FC<MemberDashboardProps> = ({ workspaceId }) => {
  const { user } = useSessionUser();

  const {
    data: trainer,
    isLoading: isLoadingTrainer,
    error: trainerError,
  } = useGetWorkspaceTrainer({
    workspaceId,
    enabled: !!workspaceId,
  });

  const {
    data: participation,
    isLoading: isLoadingParticipation,
    error: participationError,
  } = useGetMemberParticipation({
    workspaceId,
    enabled: !!workspaceId,
  });

  const isLoading = isLoadingTrainer || isLoadingParticipation;

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col gap-8">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  // Show error if there's an error loading participation data
  if (participationError) {
    const error = formatZodiosError(
      'getMemberParticipation',
      participationError
    );
    const errorMessage = error?.error || 'Unknown error';

    // Check for specific error messages
    if (errorMessage.includes('not a member')) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Typography.H2>
            <Trans>No Workspace Access</Trans>
          </Typography.H2>
          <Typography.Paragraph className="text-center text-muted-foreground">
            <Trans>
              You are not a member of this workspace. Please contact your
              administrator for access.
            </Trans>
          </Typography.Paragraph>
        </div>
      );
    }

    // Handle other errors
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Typography.H2>
          <Trans>Error Loading Data</Trans>
        </Typography.H2>
        <Typography.Paragraph className="text-center text-muted-foreground">
          <Trans>
            Unable to load participation information. Please try again later or
            contact support if the problem persists.
          </Trans>
        </Typography.Paragraph>
        {errorMessage && (
          <Typography.Paragraph className="text-center text-sm text-muted-foreground">
            {errorMessage}
          </Typography.Paragraph>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography.H1>
          <Trans>Welcome,</Trans> {user?.name || user?.email}
        </Typography.H1>
        {participation && (
          <Typography.Paragraph className="text-muted-foreground">
            {participation.workspaceName}
          </Typography.Paragraph>
        )}
      </div>

      <TrainerInfoCard trainer={trainer} error={trainerError} />
      <ParticipationInfoCard participation={participation} />
    </div>
  );
};
