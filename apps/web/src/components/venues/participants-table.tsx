/* eslint-disable import/no-extraneous-dependencies */
import type { VenueUserStatus } from '@meltstudio/client-common';
import {
  useDeleteVenueUser,
  useUpdateVenueUserStatus,
} from '@meltstudio/client-common';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from '@meltstudio/theme';
import { TrashIcon } from '@radix-ui/react-icons';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { ParticipantStatusBadge } from '@/components/venues/participant-status-badge';
import type { DbVenueUserWithRelations } from '@/db/schema';
import { DataTable } from '@/ui/data-table';
import { SimpleTooltip } from '@/ui/simple-tooltip';

export type ParticipantRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: VenueUserStatus;
  comments: string | null;
};

const columnHelper = createColumnHelper<ParticipantRow>();

export type ParticipantsTableProps = {
  venueId: string;
  workspaceId: string;
  participants: DbVenueUserWithRelations[];
  onRefetch: () => void;
};

type ParticipantsContextValue = {
  onStatusChange: (userId: string, status: VenueUserStatus) => void;
  onRefetch: () => void;
};

const ParticipantsContext = createContext<ParticipantsContextValue | null>(
  null
);

const StatusCell = ({
  getValue,
}: CellContext<ParticipantRow, VenueUserStatus>): React.ReactNode => (
  <ParticipantStatusBadge status={getValue()} />
);

const ActionsHeader = (): React.ReactNode => {
  const { t } = useTranslation();
  return <div className="text-center">{t('Actions')}</div>;
};

const ActionsCell = ({
  row,
}: CellContext<ParticipantRow, unknown>): React.ReactNode => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const context = useContext(ParticipantsContext);

  if (!context) {
    throw new Error('ActionsCell must be used within a ParticipantsContext');
  }
  const { onStatusChange, onRefetch } = context;
  const participant = row.original;

  const deleteVenueUser = useDeleteVenueUser({
    params: { id: participant.id },
  });

  const statusOptions: VenueUserStatus[] = [
    'joined',
    'checking',
    'completed',
    'failed',
  ];

  const handleRemove = async (): Promise<void> => {
    await deleteVenueUser.mutateAsync(undefined);
    toast({
      title: t('Participant removed'),
      description: t('The participant has been removed from the venue'),
    });
    onRefetch();
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Trans>Change Status</Trans>
            <ChevronDown className="ml-1 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statusOptions.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => onStatusChange(participant.userId, status)}
              disabled={status === participant.status}
            >
              <ParticipantStatusBadge status={status} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <SimpleTooltip content={t('Remove Participant')}>
        <Button variant="destructive" size="sm" onClick={handleRemove}>
          <TrashIcon className="size-4" />
        </Button>
      </SimpleTooltip>
    </div>
  );
};

export const ParticipantsTable: FC<ParticipantsTableProps> = ({
  venueId,
  workspaceId,
  participants,
  onRefetch,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateStatus = useUpdateVenueUserStatus();

  const handleStatusChange = useCallback(
    (userId: string, newStatus: VenueUserStatus): void => {
      updateStatus.mutate(
        { workspaceId, venueId, userId, status: newStatus },
        {
          onSuccess: () => {
            toast({
              title: t('Status updated'),
              description: t('Participant status has been updated'),
            });
            onRefetch();
          },
          onError: () => {
            toast({
              title: t('Error'),
              description: t('Failed to update participant status'),
              variant: 'destructive',
            });
          },
        }
      );
    },
    [updateStatus, workspaceId, venueId, t, toast, onRefetch]
  );

  const contextValue = useMemo(
    () => ({ onStatusChange: handleStatusChange, onRefetch }),
    [handleStatusChange, onRefetch]
  );

  const rows: ParticipantRow[] = useMemo(() => {
    return participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      userName: p.user.name,
      userEmail: p.user.email,
      status: p.status as VenueUserStatus,
      comments: p.comments,
    }));
  }, [participants]);

  const columns = useMemo(
    (): ColumnDef<ParticipantRow>[] => [
      columnHelper.accessor('userName', {
        header: t('Name'),
        cell: (info) => info.getValue(),
      }) as ColumnDef<ParticipantRow>,
      columnHelper.accessor('userEmail', {
        header: t('Email'),
        cell: (info) => info.getValue(),
      }) as ColumnDef<ParticipantRow>,
      columnHelper.accessor('status', {
        header: t('Status'),
        cell: StatusCell,
      }) as ColumnDef<ParticipantRow>,
      columnHelper.accessor('comments', {
        header: t('Comments'),
        cell: (info) => info.getValue() ?? '-',
      }) as ColumnDef<ParticipantRow>,
      columnHelper.display({
        id: 'actions',
        header: ActionsHeader,
        cell: ActionsCell,
      }) as ColumnDef<ParticipantRow>,
    ],
    [t]
  );

  return (
    <ParticipantsContext.Provider value={contextValue}>
      <DataTable columns={columns} data={rows} />
    </ParticipantsContext.Provider>
  );
};
