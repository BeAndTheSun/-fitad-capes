import { useGetModelRelations, useGetRecords } from '@meltstudio/client-common';
import { useParsedSearchParams } from '@meltstudio/core';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@meltstudio/theme';
import type { UserRoleEnum } from '@meltstudio/types';
import { USER_ROLE_LABELS } from '@meltstudio/types';
import type {
  DataTableColumnHeaderProps,
  DataTableGlobalFilter,
} from '@meltstudio/ui';
import {
  AlgoliaTableColumnHeader,
  DataTable,
  DataTableColumnHeader,
  SimpleTooltip,
  useAlgoliaRefresh,
} from '@meltstudio/ui';
import type { AnyModelType } from '@meltstudio/zod-schemas';
import { Pencil1Icon } from '@radix-ui/react-icons';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { TFunction } from 'next-i18next';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { ManageUserWorkspaceModal } from '@/components/admin/add-to-workspace-modal';
import { DeleteRecord } from '@/components/admin/delete-record';
import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { modelsConfig } from '@/config/super-admin';
import { useModelByRoute } from '@/hooks/use-model-by-route';
import type { NextPageWithLayout } from '@/types/next';

const HIDDEN_COLUMNS = [
  'venue-phone_number',
  'venue-company_website',
  'venue-social_media_page',
  'venue-superfit_menu_link',
];

export const searchParamsSchema = z.object({
  pagination: z
    .object({
      pageIndex: z.number().int().nonnegative(),
      pageSize: z.number().int().positive(),
    })
    .catch({ pageIndex: 0, pageSize: 10 }),

  search: z.string().optional().catch(undefined),
  isActive: z.coerce.boolean().optional().catch(undefined),
  filters: z
    .union([
      z
        .object({
          search: z.string().optional(),
          role: z.string().optional(),
          isSuperAdmin: z.coerce.boolean().optional(),
        })
        .optional(),
      z.string().transform((val) => {
        try {
          const parsed = JSON.parse(val) as Record<string, unknown>;
          return parsed;
        } catch {
          return undefined;
        }
      }),
    ])
    .catch(undefined),
});

const columnHelper = createColumnHelper<AnyModelType>();

const USE_ALGOLIA = false;

const LogoPreviewButton: FC<{ logoKey: string }> = ({ logoKey }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ensureUrl = useCallback(async (): Promise<void> => {
    if (!logoKey || url) return;

    if (typeof logoKey === 'string' && /^https?:\/\//.test(logoKey)) {
      setUrl(logoKey);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/storage/files/${logoKey}`);
      if (!res.ok) throw new Error('Failed to fetch logo URL');
      const data = (await res.json()) as { url?: string };
      const resolved = data?.url ?? null;
      setUrl(resolved);
    } catch {
      setUrl(null);
    } finally {
      setLoading(false);
    }
  }, [logoKey, url]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ensureUrl();
  }, [open, ensureUrl]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onMouseEnter={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            ensureUrl();
          }}
        >
          <Trans>View</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Logo preview</Trans>
          </DialogTitle>
        </DialogHeader>
        {loading && (
          <span className="text-sm text-gray-400">
            <Trans>Loading...</Trans>
          </span>
        )}
        {!loading && url && (
          <div className="relative" style={{ width: '100%', height: '70vh' }}>
            <Image
              src={url}
              alt="logo"
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>
        )}
        {!loading && !url && (
          <span className="text-gray-400">
            <Trans>No logo</Trans>
          </span>
        )}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
          >
            <Trans>Open in new tab</Trans>
          </a>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

type UseColumnsProps = {
  modelName: string;
  urlModel: string;
  t: TFunction;
  refetch: () => void;
  relationLabelMap: Record<string, Record<string, string>>;
};

const MANAGE_ROUTES: Record<string, (id: string) => string> = {
  workspace: (id) => `/super-admin/manage/workspace?id=${id}`,
  venue: (id) => `/super-admin/manage/venue?id=${id}`,
};

export const getManageUrl = (modelName: string, id: string): string => {
  return MANAGE_ROUTES[modelName]?.(id) ?? `/super-admin/${modelName}/${id}`;
};

const useColumns = ({
  modelName,
  urlModel,
  t,
  refetch,
  relationLabelMap,
}: UseColumnsProps): ColumnDef<AnyModelType>[] => {
  const getHeader: () => <TData, TValue>(
    props: DataTableColumnHeaderProps<TData, TValue>
  ) => React.ReactNode = () => {
    if (USE_ALGOLIA) {
      return AlgoliaTableColumnHeader;
    } else {
      return DataTableColumnHeader;
    }
  };
  const HeaderComponent = getHeader();

  return useMemo(() => {
    const baseColumns: ColumnDef<AnyModelType>[] = [
      ...(modelsConfig[modelName]?.fields || [])
        .filter(
          (field) =>
            field.type !== 'manyRelation' &&
            !['password', 'id'].includes(field.key.toLowerCase())
        )
        .map((field) =>
          columnHelper.accessor(field.key, {
            id: `${modelName}-${field.key}`,
            header: ({ column }) => (
              <HeaderComponent column={column} title={field.label} />
            ),
            cell: (context) => {
              const value = context.getValue<string | number | boolean>();

              if (field.type === 'boolean') {
                if (field.type !== 'boolean') return null;

                const isActive = Boolean(value);

                if (modelName === 'venue' && field.key === 'isActive') {
                  const statusClasses = isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

                  return (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses}`}
                    >
                      {isActive ? t('Active') : t('Inactive')}
                    </span>
                  );
                }

                return isActive ? t('Yes') : t('No');
              }

              if (field.type === 'relation' && field.relationModel) {
                const label =
                  relationLabelMap[field.relationModel]?.[String(value)];
                return label ?? value;
              }
              if (field.type === 'select' && field.options) {
                const valueStr = String(value);
                const option = field.options.find(
                  (opt) => String(opt.value as string | number) === valueStr
                );
                return option?.label ?? value;
              }
              if (field.type === 'color' || field.key === 'brand_color') {
                const hex = typeof value === 'string' ? value : '';
                return (
                  <div
                    className="flex items-center gap-2"
                    style={{ minWidth: 140 }}
                  >
                    <span
                      aria-label={hex || 'color'}
                      className="inline-block size-4 rounded-full border"
                      style={{ backgroundColor: hex || 'transparent' }}
                    />
                    <span>{hex}</span>
                  </div>
                );
              }
              if (field.key === 'description') {
                return (
                  <div
                    style={{ minWidth: 320 }}
                    className="whitespace-pre-wrap break-words"
                  >
                    {String(value ?? '')}
                  </div>
                );
              }

              if (field.key === 'logo_file') {
                const logoKey = typeof value === 'string' ? value : '';
                return (
                  <div
                    className="flex items-center gap-2"
                    style={{ minWidth: 140 }}
                  >
                    {logoKey ? (
                      <LogoPreviewButton logoKey={logoKey} />
                    ) : (
                      <span className="text-gray-400">
                        <Trans>No logo</Trans>
                      </span>
                    )}
                  </div>
                );
              }

              return value;
            },
          })
        ),
    ];

    if (modelName === 'users') {
      // Add Workspace column for users model
      baseColumns.push(
        columnHelper.accessor('workspaces', {
          id: `${modelName}-workspace`,
          header: ({ column }) => (
            <HeaderComponent column={column} title={t('Workspace')} />
          ),
          cell: (context) => {
            const workspaces = context.getValue() as
              | { role: string; workspace: { name: string } }[]
              | undefined;
            if (!workspaces || workspaces.length === 0) {
              return <span className="text-gray-400">-</span>;
            }
            const filteredWorkspaces = workspaces
              .map((w) => {
                return {
                  name: w.workspace?.name,
                  role: USER_ROLE_LABELS[w.role as UserRoleEnum] || w.role,
                };
              })
              .filter(Boolean);
            return (
              <div className="flex flex-wrap gap-2">
                {filteredWorkspaces.map((workspace) => (
                  <SimpleTooltip
                    key={workspace.name ?? workspace.role}
                    content={
                      workspace?.role
                        ? `Role: ${workspace.role}`
                        : 'No role assigned'
                    }
                  >
                    <Badge>{workspace.name}</Badge>
                  </SimpleTooltip>
                ))}
              </div>
            );
          },
        })
      );
    }
    // Add Actions column
    baseColumns.push(
      columnHelper.accessor('id', {
        id: `${modelName}-actions`,
        header: ({ column }) => (
          <HeaderComponent column={column} title={t('Actions')} />
        ),
        cell: (context) => {
          const id = context.getValue<string>();
          return (
            <div className="flex items-center gap-4">
              <Link href={getManageUrl(urlModel, id)}>
                <Pencil1Icon className="size-5" />
              </Link>
              {modelName !== 'globalFeatureFlags' && (
                <DeleteRecord
                  data={{ model: modelName, id }}
                  onSuccessfulDelete={refetch}
                />
              )}
            </div>
          );
        },
      })
    );

    return baseColumns;
  }, [HeaderComponent, modelName, refetch, relationLabelMap, t, urlModel]);
};

const AdminModelPageContent: FC = () => {
  const { model, modelName } = useModelByRoute();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useParsedSearchParams(searchParamsSchema);

  const relationNames = useMemo(
    () =>
      model?.fields
        .filter((field) => !!field.relationModel)
        .map((field) => field.relationModel as string) ?? [],
    [model]
  );

  const relations = useGetModelRelations({
    model: model?.name ?? '',
    relations: relationNames,
  });

  const relationLabelMap = useMemo(
    () =>
      relationNames.reduce(
        (acc, relationName, index) => {
          const relationData = relations[index]?.data;
          if (relationData) {
            acc[relationName] = relationData.reduce(
              (innerAcc, { id, label }) => ({
                ...innerAcc,
                [id]: label,
              }),
              {} as Record<string, string>
            );
          }
          return acc;
        },
        {} as Record<string, Record<string, string>>
      ),
    [relationNames, relations]
  );

  const params = {
    model: modelName,
    enabled: !!model,
    pagination: {
      pageIndex: searchParams.pagination.pageIndex,
      pageSize: searchParams.pagination.pageSize,
    },
    filters: ((): {
      search?: string;
      role?: string;
      isSuperAdmin?: boolean;
      isActive?: boolean;
    } => {
      const filters: {
        search?: string;
        role?: string;
        isSuperAdmin?: boolean;
        isActive?: boolean;
      } = {};
      if (searchParams.search) {
        filters.search = searchParams.search;
      }
      if (typeof searchParams.filters?.role === 'string') {
        filters.role = searchParams.filters.role;
      }
      if (typeof searchParams.filters?.isSuperAdmin === 'boolean') {
        filters.isSuperAdmin = searchParams.filters.isSuperAdmin;
      }
      if (searchParams.isActive !== undefined) {
        filters.isActive = searchParams.isActive;
      }

      return filters;
    })(),
  };

  const { data, error, isLoading, refetch } = useGetRecords({
    model: modelName,
    enabled: !!model,
    pagination: params.pagination,
    filters: params.filters,
  });

  const { refresh } = useAlgoliaRefresh();

  const baseColumns = useColumns({
    modelName,
    urlModel: model?.url || '',
    t,
    refetch: USE_ALGOLIA ? refresh : refetch,
    relationLabelMap,
  });

  const columns = baseColumns.filter(
    (column) => !HIDDEN_COLUMNS.includes(column.id || '')
  );

  const redirectTo = (): string => {
    if (model?.url === 'venue') {
      return '/super-admin/manage/venue';
    }

    return model?.url === 'workspace'
      ? '/super-admin/wizard'
      : `/super-admin/${model?.url}/create`;
  };

  const globalFiltersDefs: DataTableGlobalFilter[] = useMemo(
    () => [
      {
        type: 'search',
        id: 'search',
        placeholder: t('Search'),
      },
    ],
    [t]
  );

  if (!model || !modelsConfig[modelName]) {
    return <div>Model not found</div>;
  }

  const handleFilterChange = (value: string | undefined): void => {
    const queryParams = new URLSearchParams();
    queryParams.set(
      'pagination',
      JSON.stringify({
        pageIndex: 0,
        pageSize: searchParams.pagination.pageSize,
      })
    );
    if (searchParams.search) {
      queryParams.set('search', searchParams.search);
    }
    if (value !== undefined) {
      queryParams.set('isActive', value);
    }
    router
      .push(`/super-admin/${model?.url}?${queryParams.toString()}`, undefined, {
        shallow: true,
      })
      .catch(() => {});
  };

  const commonComponent = (
    <div className="flex items-center justify-between pb-2">
      <h1>{modelsConfig[modelName]?.displayName || t('Model')}</h1>
      <div className="flex gap-2">
        {modelName !== 'globalFeatureFlags' && (
          <>
            <Button>
              <Link href={redirectTo()}>
                {modelName === 'users' ? (
                  <Trans>Create User</Trans>
                ) : (
                  <Trans>Create</Trans>
                )}
              </Link>
            </Button>
            {modelName === 'users' && (
              <ManageUserWorkspaceModal onSuccess={refetch} />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {commonComponent}
      {modelName === 'venue' && (
        <div className="mb-4 flex items-center gap-3">
          <select
            value={
              searchParams.isActive === undefined
                ? ''
                : String(searchParams.isActive)
            }
            onChange={(e) =>
              handleFilterChange(
                e.target.value === '' ? undefined : e.target.value
              )
            }
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="">
              <Trans>All Venues</Trans>
            </option>
            <option value="true">
              <Trans>Active Only</Trans>
            </option>
            <option value="false">
              <Trans>Inactive Only</Trans>
            </option>
          </select>
        </div>
      )}
      {USE_ALGOLIA ? (
        <AlgoliaTable columns={columns} hasViewOptions={false} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          error={error ? error.message : null}
          loading={isLoading}
          pagination={searchParams.pagination}
          pageCount={data?.pageCount ?? 0}
          pageSizeOptions={[10, 20, 50]}
          globalFiltersDefs={globalFiltersDefs}
          globalFilter={{ search: searchParams.search ?? '' }}
        />
      )}
    </div>
  );
};

const AdminModelPage: NextPageWithLayout = () => {
  const { model, modelName, indexName } = useModelByRoute();

  if (!model || !modelsConfig[modelName]) {
    return (
      <div>
        <Trans>Model not found</Trans>
      </div>
    );
  }

  if (!indexName) {
    return (
      <div>
        <Trans>Index name not found</Trans>
      </div>
    );
  }

  return (
    <AlgoliaTableWrapper indexName={indexName} key={indexName}>
      <AdminModelPageContent />
    </AlgoliaTableWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default AdminModelPage;
