import { AlgoliaSearchClient } from '@meltstudio/algolia-client';
import type { DataTableProps } from '@meltstudio/ui';
import {
  AlgoliaDataTable,
  AlgoliaPagination,
  AlgoliaRowsPerPage,
} from '@meltstudio/ui';
import { useTranslation } from 'next-i18next';
import type { ComponentType, FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { Configure, InstantSearch } from 'react-instantsearch';

import type { TableFilter } from '@/types/data-table';

type AlgoliaTableProps<TData> = {
  columns: DataTableProps<TData>['columns'];
  withSearch?: boolean;
  withPagination?: boolean;
  filters?: string;
  searchPlaceholder?: string;
  actionButtonText?: string;
  actionButtonHref?: string;
  actionButton?: React.ReactNode;
  hasViewOptions?: boolean;
  tableFilters?: TableFilter[];
};

export const AlgoliaTableWrapper: FC<
  PropsWithChildren<{ indexName: string }>
> = ({ children, indexName }): React.ReactNode => {
  const searchClient = AlgoliaSearchClient.createAlgoliaClient();
  const sortedIndexName = `${indexName}_createdAt_desc`;
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={sortedIndexName}
      routing
    >
      {children}
    </InstantSearch>
  );
};

export function withAlgoliaSearch<P extends object>(
  WrappedComponent: ComponentType<P>,
  indexName: string
): ComponentType<P> {
  return function WithAlgoliaSearch(props: P): JSX.Element {
    const searchClient = AlgoliaSearchClient.createAlgoliaClient();

    return (
      <InstantSearch searchClient={searchClient} indexName={indexName} routing>
        <WrappedComponent {...props} />
      </InstantSearch>
    );
  };
}

export const AlgoliaTable = <TData extends Record<string, unknown>>(
  props: AlgoliaTableProps<TData>
): React.ReactNode => {
  const { t } = useTranslation();

  const {
    columns,
    withSearch,
    withPagination,
    tableFilters,
    searchPlaceholder,
    actionButtonText,
    actionButtonHref,
    actionButton,
    hasViewOptions,
    filters: staticFilters,
  } = props;

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      tableFilters?.forEach((filter) => {
        if (filter.defaultValue) {
          initial[filter.key] = filter.defaultValue;
        }
      });
      return initial;
    }
  );

  const buildFiltersString = (): string => {
    const dynamicFilters = Object.entries(activeFilters)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value && value !== '')
      .map(([key, value]) => `${key}:${value}`);

    const allFilters = [
      ...(staticFilters ? [staticFilters] : []),
      ...dynamicFilters,
    ].filter(Boolean);

    return allFilters.join(' AND ');
  };

  const handleFilterChange = (key: string, value: string): void => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const finalFilters = buildFiltersString();

  return (
    <div className="space-y-4">
      <Configure filters={finalFilters} />
      <AlgoliaDataTable
        columns={columns}
        withSearch={withSearch}
        searchPlaceholder={searchPlaceholder || t('Search')}
        actionButtonText={actionButtonText}
        actionButtonHref={actionButtonHref}
        actionButton={actionButton}
        hasViewOptions={hasViewOptions}
        tableFilters={tableFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {withPagination && (
        <div className=" flex w-full justify-end gap-3">
          <AlgoliaRowsPerPage />
          <AlgoliaPagination />
        </div>
      )}
    </div>
  );
};
