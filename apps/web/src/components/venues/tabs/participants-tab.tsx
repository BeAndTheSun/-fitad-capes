/* eslint-disable import/no-extraneous-dependencies */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@meltstudio/theme';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';

import { AddParticipantModal } from '@/components/venues/add-participant-modal';
import { ParticipantsTable } from '@/components/venues/participants-table';
import type { DbVenueUserWithRelations } from '@/db/schema';

type ParticipantsTabProps = {
  venueId: string;
  venueName: string;
  workspaceId: string;
  participants: DbVenueUserWithRelations[];
  loading: boolean;
  onRefetch: () => void;
};

export const ParticipantsTab: FC<ParticipantsTabProps> = ({
  venueId,
  venueName,
  workspaceId,
  participants,
  loading,
  onRefetch,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('Super Participants')}</CardTitle>
          <CardDescription>
            {t('Manage participants and their status in this venue')}
          </CardDescription>
        </div>
        <AddParticipantModal
          venueId={venueId}
          venueName={venueName}
          existingParticipants={participants}
          onSuccess={() => onRefetch()}
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <ParticipantsTable
            venueId={venueId}
            workspaceId={workspaceId}
            participants={participants}
            onRefetch={onRefetch}
          />
        )}
      </CardContent>
    </Card>
  );
};
