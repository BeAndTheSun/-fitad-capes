import { useGetWebhookEvents } from '@meltstudio/client-common/src/sdk';
import { useParsedSearchParams } from '@meltstudio/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import { z } from 'zod';

import type { DbWebhookEvents } from '@/db/schema';
import type { DataTableGlobalFilter } from '@/ui/data-table';
import { DataTable, DataTableColumnHeader } from '@/ui/data-table';
import { handleDate } from '@/utils/date-utils';

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
        column: z.enum(['status', 'eventType', 'eventTableName']),
        order: z.enum(['asc', 'desc']),
      })
    )
    .catch([]),
});

const webhookEventsColumnsHelper = createColumnHelper<DbWebhookEvents>();
// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useColumns = () => {
  const { t } = useTranslation();
  const columns = useMemo(
    () => [
      webhookEventsColumnsHelper.accessor('createdAt', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Creation Date')} />
        ),
        cell: ({ row }) => {
          return handleDate(row.original.createdAt, true);
        },
      }),
      webhookEventsColumnsHelper.accessor('eventType', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Type of event')} />
        ),
      }),
      webhookEventsColumnsHelper.accessor('eventTableName', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Event table')} />
        ),
      }),
      webhookEventsColumnsHelper.accessor('status', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Status')} />
        ),
      }),
      webhookEventsColumnsHelper.accessor('errorMessage', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Error Message')} />
        ),
      }),
    ],
    [t]
  );

  return columns;
};

export const WebhookEventsTable = ({
  webhookId,
}: {
  webhookId: string;
}): React.JSX.Element => {
  const { t } = useTranslation();

  const searchParams = useParsedSearchParams(searchParamsSchema);

  const params = {
    webhookId,
    filters: { search: searchParams.search },
    pagination: {
      pageIndex: searchParams.pagination.pageIndex,
      pageSize: searchParams.pagination.pageSize,
    },
    sorting: searchParams.sorting,
  };

  const { data, isLoading } = useGetWebhookEvents(params);
  const columns = useColumns();
  const pageCount = data
    ? Math.ceil(data.items.length / searchParams.pagination.pageSize)
    : 1;

  const globalFilterDefs: DataTableGlobalFilter[] = [
    {
      type: 'search',
      id: 'search',
      placeholder: `${t('Search by status')}...`,
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        pagination={searchParams.pagination}
        pageCount={pageCount}
        sorting={searchParams.sorting}
        globalFiltersDefs={globalFilterDefs}
        globalFilter={{ search: searchParams.search }}
      />
    </div>
  );
};
