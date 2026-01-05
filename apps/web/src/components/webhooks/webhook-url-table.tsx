/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  useDeleteWebhook,
  useListAllWebhooks,
} from '@meltstudio/client-common';
import { useParsedSearchParams } from '@meltstudio/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { useSessionUser } from '@/components/user/user-context';
import { Button, RemoveItemButton } from '@/theme/index';
import type { DataTableGlobalFilter } from '@/ui/data-table';
import { DataTable, DataTableColumnHeader } from '@/ui/data-table';
import { Typography } from '@/ui/typography';

import { AddWebhookUrlButton } from './button';
import { WebhookEventsDialog } from './dialog-webhooks-events';

const searchParamsSchema = z.object({
  pagination: z
    .object({
      pageIndex: z.number().int().nonnegative(),
      pageSize: z.number().int().positive(),
    })
    .catch({ pageIndex: 0, pageSize: 10 }),
  search: z.string().optional().catch(undefined),
  sorting: z
    .array(
      z.object({
        column: z.enum(['name', 'url']),
        order: z.enum(['asc', 'desc']),
      })
    )
    .catch([]),
});

const DeleteWebhook: React.FC<{
  webhookId: string;
  params: {
    workspaceId: string;
    filters: {
      search: string | undefined;
    };
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
    sorting: {
      column: 'name' | 'url';
      order: 'asc' | 'desc';
    }[];
  };
}> = ({ webhookId, params }) => {
  const { t } = useTranslation();
  const { mutateAsync, isLoading } = useDeleteWebhook();
  const { refetch, isFetching } = useListAllWebhooks(params);

  const handleConfirmDelete = async () => {
    await mutateAsync({ id: webhookId });
    await refetch();
  };

  return (
    <RemoveItemButton
      label={t('this webhook url')}
      onConfirmDelete={handleConfirmDelete}
      loading={isLoading || isFetching}
    />
  );
};

const webhookUrlColumnsHelper = createColumnHelper<{
  id: string;
  url: string;
  name: string;
}>();

// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useColumns = (
  setOpenDialog: (open: boolean, webhookId: string) => void,
  params: {
    workspaceId: string;
    filters: {
      search: string | undefined;
    };
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
    sorting: {
      column: 'name' | 'url';
      order: 'asc' | 'desc';
    }[];
  }
) => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      webhookUrlColumnsHelper.accessor('name', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Name')} />
        ),
        enableHiding: true,
      }),
      webhookUrlColumnsHelper.accessor('url', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="URL" />
        ),
        enableHiding: true,
      }),
      webhookUrlColumnsHelper.display({
        id: 'actions',
        header: t('Actions'),
        cell: ({ row }) => (
          <Button onClick={() => setOpenDialog(true, row.original.id)}>
            {t('View Events')}
          </Button>
        ),
      }),
      webhookUrlColumnsHelper.display({
        id: 'delete',
        header: t('Delete'),
        cell: ({ row }) => (
          <DeleteWebhook webhookId={row.original.id} params={params} />
        ),
      }),
    ],
    [params, setOpenDialog, t]
  );
};

export const WebhookUrlsTable: FC = () => {
  const { t } = useTranslation();
  const { selectedWorkspace } = useSessionUser();
  const searchParams = useParsedSearchParams(searchParamsSchema);

  const params = {
    workspaceId: selectedWorkspace?.id ?? '',
    filters: { search: searchParams.search },
    pagination: {
      pageIndex: searchParams.pagination.pageSize,
      pageSize: searchParams.pagination.pageIndex,
    },
    sorting: searchParams.sorting,
  };

  const { data, error, isLoading } = useListAllWebhooks(params);

  const [openDialog, setOpenDialog] = useState<{
    open: boolean;
    webhookId: string | null;
  }>({ open: false, webhookId: null });

  const handleOpenDialog = (open: boolean, webhookId: string) => {
    setOpenDialog({ open, webhookId });
  };

  const columns = useColumns(handleOpenDialog, params);

  const pageCount = data
    ? Math.ceil(data.items.length / searchParams.pagination.pageSize)
    : 1;

  const globalFilterDefs: DataTableGlobalFilter[] = [
    {
      type: 'search',
      id: 'search',
      placeholder: `${t('Search by url')}...`,
    },
  ];

  return (
    <div>
      <br />
      <Typography.H3 className="mb-4">{t('Webhooks')}</Typography.H3>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        error={error != null ? 'There was an error' : null}
        pagination={searchParams.pagination}
        pageCount={pageCount}
        sorting={searchParams.sorting}
        globalFiltersDefs={globalFilterDefs}
        globalFilter={{ search: searchParams.search }}
        actionButton={<AddWebhookUrlButton className="h-[2.29rem]" />}
      />
      <WebhookEventsDialog
        open={openDialog.open}
        webhookId={openDialog.webhookId ?? ''}
        onOpenChange={(open) => setOpenDialog((prev) => ({ ...prev, open }))}
      />
      <br />
    </div>
  );
};
