import type { Users } from '@meltstudio/client-common';
import { formatZodiosError, useListUsers } from '@meltstudio/client-common';
import { useParsedSearchParams } from '@meltstudio/core';
import type { MemberFiltersType } from '@meltstudio/types';
import type { FC, PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { z } from 'zod';

import type { ApiCommonErrorType } from '@/api/routers/def-utils';

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
        column: z.enum(['name', 'email', 'createdAt']),
        order: z.enum(['asc', 'desc']),
      })
    )
    .catch([]),
});

type MembersPageSearchParamsType = z.infer<typeof searchParamsSchema>;

type MemberContextType = {
  data: Users | undefined;
  formattedError: ApiCommonErrorType | null;
  isLoading: boolean;
  filters: MemberFiltersType;
  searchParams: MembersPageSearchParamsType;
  setFilters: (f: MemberFiltersType) => void;
  refetch: () => Promise<void> | void;
};

const MemberContext = createContext<MemberContextType | null>(null);

export const MembersTableProvider: FC<PropsWithChildren> = ({ children }) => {
  const searchParams = useParsedSearchParams(searchParamsSchema);
  const [filters, setFilters] = useState<MemberFiltersType>({});

  const { data, error, isLoading, refetch } = useListUsers({
    pagination: {
      pageSize: searchParams.pagination.pageSize,
      pageIndex: searchParams.pagination.pageIndex,
    },
    filters: {
      search: searchParams.search,
      ...filters,
    },
    sorting: searchParams.sorting,
  });

  const formattedError = formatZodiosError('listUsers', error);

  const loading = isLoading;

  const handleRefetch = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      data,
      formattedError,
      isLoading: loading,
      filters,
      searchParams,
      setFilters,
      refetch: handleRefetch,
    }),
    [data, filters, formattedError, loading, searchParams, handleRefetch]
  );

  return (
    <MemberContext.Provider value={value}>{children}</MemberContext.Provider>
  );
};

export const useMembersTableData = (): MemberContextType => {
  const context = useContext(MemberContext);
  if (!context) throw new Error('No member table context found');
  return context;
};
