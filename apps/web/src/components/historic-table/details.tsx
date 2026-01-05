import { FileTextIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';

import { useGetHistoricActionDescription } from '@/client-common/sdk';
import { ActivityActions } from '@/common-types/index';
import type { TableNames } from '@/common-types/tables-history';
import { FieldDisplay, SideModal } from '@/theme/index';
import { Typography } from '@/ui/typography';
import { handleDate } from '@/utils/date-utils';
import {
  getLocalizedActivityActionName,
  getLocalizedTableName,
} from '@/utils/localization';

import type { NewDbTablesHistoryExtended } from '.';

type ActionDescription = {
  id: string;
  action: ActivityActions;
  tableName: TableNames;
  recordId: string;
  actionData: {
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  };
  timestamp: string;
};

type HistoryDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  historyData: NewDbTablesHistoryExtended;
};

export const HistoryDetails: React.FC<HistoryDetailsProps> = ({
  isOpen,
  onClose,
  historyData,
}) => {
  const { t } = useTranslation();

  const { data: datavalues } = useGetHistoricActionDescription({
    id: historyData?.id ?? '',
  });

  const data = datavalues as ActionDescription;

  const formatValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return t('empty');
    if (typeof value === 'boolean') return value ? t('Yes') : t('No');

    if (Array.isArray(value)) {
      if (value.length === 0) return t('empty');

      if (value.every((v) => typeof v === 'string' || typeof v === 'number')) {
        return (
          <ul className="list-inside list-disc space-y-1">
            {value.map((item) => (
              <li>{String(item)}</li>
            ))}
          </ul>
        );
      }

      return (
        <pre className="whitespace-pre-wrap break-words text-sm">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    if (typeof value === 'string') {
      if (value.includes('T') && value.includes('Z')) {
        try {
          return new Date(value).toLocaleString();
        } catch {
          return value;
        }
      }

      if (value.startsWith('http')) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words underline"
          >
            {value}
          </a>
        );
      }

      return value;
    }

    if (typeof value === 'object') {
      return (
        <pre className="whitespace-pre-wrap break-words text-sm">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return String(value);
  };

  const renderFieldChanges = (
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ): JSX.Element[] => {
    const ignoredKeys = ['id', 'createdAt', 'workspaceId'];
    const changes: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }> = [];

    Object.keys(newData).forEach((key) => {
      if (ignoredKeys.includes(key)) return;
      const oldValue = oldData?.[key];
      const newValue = newData[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    return changes.map(({ field, oldValue, newValue }) => (
      <div
        key={field}
        className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-100">
          {field}
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
          <div className="px-4 py-3">
            <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              {t('Previous value')}
            </div>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {formatValue(oldValue)}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              {t('New value')}
            </div>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {formatValue(newValue)}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={<Trans>History Details</Trans>}
      overlay
    >
      {data ? (
        <>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <Typography.H4 className="mb-2 ">
              {t('General Information')}
            </Typography.H4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <FieldDisplay
                label={t('Action')}
                value={getLocalizedActivityActionName(t, data.action)}
              />
              <FieldDisplay
                label={t('Action performed by')}
                value={historyData.user.name}
              />

              <FieldDisplay
                label={t('Table')}
                value={getLocalizedTableName(t, data.tableName)}
              />
              <FieldDisplay
                label={t('Date')}
                value={handleDate(data.timestamp, true)}
              />
            </div>
          </div>

          {data.action === ActivityActions.CREATE && (
            <div className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/10">
              <div className="flex items-start gap-3">
                <div className="mt-2">
                  <FileTextIcon className="text-green-500" />
                </div>
                <div>
                  <Typography.H4 className="text-green-600 dark:text-green-400">
                    {getLocalizedTableName(t, data.tableName)} created
                  </Typography.H4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {t('The record')}{' '}
                    <strong>
                      {typeof data.actionData.new?.name === 'string'
                        ? data.actionData.new.name
                        : 'N/A'}
                    </strong>{' '}
                    {t('was created in')}{' '}
                    <strong>{getLocalizedTableName(t, data.tableName)}</strong>
                  </p>
                </div>
              </div>
              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                {formatValue(data.actionData.new)}
              </div>
            </div>
          )}

          {data.action === ActivityActions.DELETE && (
            <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
              <div className="flex items-start gap-3">
                <div className="mt-2">
                  <TrashIcon className="text-red-500" />
                </div>
                <div>
                  <Typography.H4 className="text-red-600 dark:text-red-400">
                    {getLocalizedTableName(t, data.tableName)} deleted
                  </Typography.H4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {t('The record')}{' '}
                    <strong>
                      {typeof data.actionData.old?.name === 'string'
                        ? data.actionData.old.name
                        : 'N/A'}
                    </strong>{' '}
                    {t('was deleted from')}{' '}
                    <strong>{getLocalizedTableName(t, data.tableName)}</strong>
                  </p>
                </div>
              </div>
              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                {formatValue(data.actionData.old)}
              </div>
            </div>
          )}

          {data.action === ActivityActions.UPDATE &&
            data.actionData.old &&
            data.actionData.new && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                <div className="mb-4 flex items-start gap-3">
                  <div className="mt-2">
                    <Pencil1Icon className="text-blue-500" />
                  </div>
                  <div>
                    <Typography.H4 className="text-blue-600 dark:text-blue-400">
                      {getLocalizedTableName(t, data.tableName)} updated
                    </Typography.H4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {t('The record')}{' '}
                      <strong>
                        {typeof data.actionData.new?.name === 'string'
                          ? data.actionData.new.name
                          : 'N/A'}
                      </strong>{' '}
                      {t('in table')}{' '}
                      <strong>
                        {getLocalizedTableName(t, data.tableName)}
                      </strong>{' '}
                      {t('was updated with the following changes:')}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {renderFieldChanges(data.actionData.old, data.actionData.new)}
                </div>
              </div>
            )}
        </>
      ) : (
        <div className="flex items-center justify-center p-8">
          <span className="text-gray-500 dark:text-gray-400">
            {t('Loading history details...')}
          </span>
        </div>
      )}
    </SideModal>
  );
};
