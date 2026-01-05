import { createColumnHelper } from '@tanstack/react-table';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import React, { useMemo, useState } from 'react';

import type { ActivityActions, TableNames } from '@/common-types/index';
import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { useSessionUser } from '@/components/user/user-context';
import type { DbTablesHistory } from '@/db/schema';
import { Button } from '@/theme/index';
import type { TableFilter } from '@/types/data-table';
import { DataTableColumnHeader } from '@/ui/data-table';
import { handleDate } from '@/utils/date-utils';
import {
  getLocalizedActivityActionName,
  getLocalizedTableName,
} from '@/utils/localization';

import { HistoryDetails } from './details';

export type NewDbTablesHistoryExtended = Omit<
  DbTablesHistory,
  'actionDescription' | 'recordId'
> & {
  user: { name: string };
  actionDescription?: unknown;
};
type UseColumnsProps = {
  handleRowClick: (historyData: NewDbTablesHistoryExtended) => void;
};

const columnsHelper = createColumnHelper<NewDbTablesHistoryExtended>();

// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useColumns = ({ handleRowClick }: UseColumnsProps) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      columnsHelper.accessor('user.name', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('User')} />
        ),
        cell: ({ row }) => {
          return (
            <Button
              onClick={() => handleRowClick(row.original)}
              variant="unstyled"
            >
              {row.original.user.name}
            </Button>
          );
        },
      }),
      columnsHelper.accessor('actionDescription', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Action')} />
        ),
        cell(props) {
          const { row } = props;
          return getLocalizedActivityActionName(
            t,
            row.original.action as ActivityActions
          );
        },
      }),
      columnsHelper.accessor('tableName', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Table Name')} />
        ),
        cell: ({ row }) => {
          const tableName = row.original.tableName as TableNames;
          const tableNameLocalized = getLocalizedTableName(t, tableName);
          return tableNameLocalized;
        },
      }),
      columnsHelper.accessor('createdAt', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Created at')} />
        ),
        cell(props) {
          const { row } = props;
          return handleDate(row.original.createdAt, true);
        },
      }),
    ],
    [handleRowClick, t]
  );

  return columns;
};

export const HistoricTable: FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedWorkspace } = useSessionUser();

  const historyFilters: TableFilter[] = [
    {
      key: 'action',
      label: t('Filter by all actions'),
      options: [
        { label: t('Create'), value: 'create' },
        { label: t('Update'), value: 'update' },
        { label: t('Delete'), value: 'delete' },
      ],
    },
  ];
  const [selectedHistory, setSelectedHistory] =
    useState<NewDbTablesHistoryExtended>();

  const handleRowClick = (historyData: NewDbTablesHistoryExtended): void => {
    setSelectedHistory(historyData);
    setIsModalOpen(true);
  };

  const columns = useColumns({ handleRowClick });

  return (
    <div className="mt-4">
      <h1 className="mb-3 text-center text-3xl font-bold">
        <Trans>All Tables History</Trans>
      </h1>
      <AlgoliaTableWrapper indexName="tables_history">
        <AlgoliaTable
          columns={columns}
          withSearch
          withPagination
          searchPlaceholder={t('Search By Table Name')}
          filters={
            selectedWorkspace ? `workspaceId:${selectedWorkspace.id}` : ''
          }
          tableFilters={historyFilters}
          hasViewOptions
        />
      </AlgoliaTableWrapper>
      <HistoryDetails
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        historyData={selectedHistory as NewDbTablesHistoryExtended}
      />
    </div>
  );
};
