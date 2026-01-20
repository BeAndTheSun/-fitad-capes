import {
  formatZodiosError,
  useCreateVenueUser,
  useDeleteVenueUser,
  useGetMembersOfVenue,
  useGetRecord,
  useUpdateRecord,
} from '@meltstudio/client-common';
import { Button, Skeleton, toast } from '@meltstudio/theme';
import { TrashIcon } from '@radix-ui/react-icons';
import type { CellContext } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createContext, useContext, useMemo } from 'react';
import { z } from 'zod';

import { UserRoleEnum } from '@/common-types/auth';
import { ErrorMessageBox } from '@/components/error-message-box';
import { useSessionUser } from '@/components/user/user-context';
import type { ModelConfigData } from '@/config/super-admin';
import type { DbVenueUserWithRelations } from '@/db/schema';
import { useModelByRoute } from '@/hooks/use-model-by-route';
import type { NextPageWithLayout } from '@/types/next';
import { DataTable } from '@/ui/data-table';
import { useFormHelper } from '@/ui/form-hook-helper';
import { SimpleTooltip } from '@/ui/simple-tooltip';
import type { workspaceAdminModelSchema } from '@/zod-schemas/admin';

type VenuesRecordComponentProps = {
  model: ModelConfigData;
  recordId: string;
};

export type UserWorkspace = {
  id: string;
  comment: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  venueId: string;
};

export type WorkspaceUser = {
  role: UserRoleEnum;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  userId?: string;
  id?: string;
};

const columnHelper = createColumnHelper<UserWorkspace>();
const RefetchContext = createContext<() => void>(() => {});

const ActionsHeader = (): JSX.Element => {
  const { t } = useTranslation();
  return <div className="text-center">{t('Actions')}</div>;
};

const ActionsCell = (info: CellContext<UserWorkspace, string>): JSX.Element => {
  const { t } = useTranslation();
  const membersRefetch = useContext(RefetchContext);
  const deleteVenueUser = useDeleteVenueUser({
    params: {
      id: info?.row?.original.id,
    },
  });

  const onRemove = async (): Promise<void> => {
    await deleteVenueUser.mutateAsync(undefined);

    membersRefetch();
  };
  return (
    <div className="flex justify-center">
      <SimpleTooltip content={t('Remove User')}>
        <div>
          <Button variant="destructive" onClick={onRemove}>
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </SimpleTooltip>
    </div>
  );
};

const VenuesRecordComponent: React.FC<VenuesRecordComponentProps> = ({
  recordId,
  model,
}) => {
  const { selectedWorkspace } = useSessionUser();
  const { data, error, isLoading } = useGetRecord(model.name, recordId);
  const { t } = useTranslation();

  const createVenueUser = useCreateVenueUser({
    params: { venueId: recordId },
  });

  const { data: membersData, refetch: membersRefetch } = useGetMembersOfVenue({
    venueId: recordId,
    enabled: true,
  });

  const updateRecord = useUpdateRecord({
    params: { model: model.name || '', id: recordId },
  });

  const { data: usersWorkspaceData } = useGetRecord(
    'workspace',
    selectedWorkspace?.id ?? ''
  );

  const commentsList: UserWorkspace[] = useMemo(() => {
    if (!membersData) return [];
    return (
      membersData?.map((item: DbVenueUserWithRelations) => ({
        id: item.id,
        comment: item.comments,
        userId: item.userId,
        userName: item.user.name,
        userEmail: item.user.email,
        venueId: item.venueId,
      })) || []
    );
  }, [membersData]);

  const users: WorkspaceUser[] = useMemo(() => {
    if (!usersWorkspaceData) return [];
    try {
      const workspaceData = usersWorkspaceData as z.infer<
        typeof workspaceAdminModelSchema
      >;
      return (
        (workspaceData.users?.filter(
          (u) => typeof u !== 'string'
        ) as unknown as WorkspaceUser[]) || []
      );
    } catch (e) {
      return [];
    }
  }, [usersWorkspaceData]);

  const superParticipants = useMemo(
    () => users.filter((u) => u.role === UserRoleEnum.MEMBER),
    [users]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.userName, {
        id: 'name',
        header: t('Name'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.userEmail, {
        id: 'email',
        header: t('Email'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.comment, {
        id: 'comment',
        header: t('Comment'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.id, {
        id: 'actions',
        header: ActionsHeader,
        cell: ActionsCell,
      }),
    ],
    [t]
  );

  const { formComponent, form } = useFormHelper(
    {
      schema: z.object({
        user: z.string().min(1),
        description: z.string().min(1),
      }),
      fields: [
        {
          name: 'user',
          type: 'select',
          label: 'User',
          required: true,
          options: superParticipants.map((u) => ({
            value: u.userId || '',
            label: u.user?.name || '',
          })),
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
      ],
      isLoading: updateRecord.isLoading,
      submitContent: 'Update',
      onSubmit: async (values: { user: string; description: string }) => {
        const { user, description } = values;
        await createVenueUser
          .mutateAsync({
            comments: description,
            userId: user,
          })
          .then(async () => {
            await membersRefetch();
            form.reset();
            toast({
              title: t('User added'),
              description: t('User added successfully'),
            });
          })
          .catch(() => {
            toast({
              title: t('Error...'),
              description: t('User was not added to venue'),
            });
          });
      },
    },
    {
      values: {
        user: '',
        description: '',
      },
    }
  );

  if (isLoading) {
    return (
      <Skeleton
        style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
      >
        <Trans>Loading</Trans>...
      </Skeleton>
    );
  }

  const errorString = formatZodiosError('getRecord', error)?.error;

  // Handle error state
  if (errorString) {
    return <div style={{ marginTop: '20px' }}>{errorString}</div>;
  }

  // If no data found
  if (!data) {
    return <div style={{ marginTop: '20px' }}>Not found</div>;
  }

  // Render the form with the update option
  return (
    <RefetchContext.Provider value={membersRefetch}>
      <div
        style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd' }}
      >
        <h2>
          <Trans>
            Add Super Participants to {data && 'name' in data ? data.name : ''}
          </Trans>
        </h2>
        {formComponent}
        <DataTable columns={columns} data={commentsList} />
      </div>
    </RefetchContext.Provider>
  );
};

const VenuesRecordPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const recordId = typeof id === 'string' ? id : '';

  const { model, isReady } = useModelByRoute();

  if (!isReady) {
    return null;
  }

  if (!model || !recordId) {
    return <ErrorMessageBox error="Record not found" />;
  }

  return <VenuesRecordComponent model={model} recordId={recordId} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default VenuesRecordPage;
