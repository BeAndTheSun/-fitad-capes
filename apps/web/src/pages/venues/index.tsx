/* eslint-disable import/no-extraneous-dependencies */
import { formatZodiosError, useGetVenues } from '@meltstudio/client-common';
import { useParsedSearchParams } from '@meltstudio/core';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@meltstudio/theme';
import { DataTable, DataTableColumnHeader } from '@meltstudio/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { MoreVertical, QrCode, UserPlus } from 'lucide-react';
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

import { useSessionUser } from '@/components/user/user-context';
import { QrCheckInModal } from '@/components/venues/qr-check-in-modal';
import { QrInvitationModal } from '@/components/venues/qr-invitation-modal';
import type { DbVenue } from '@/db/schema';
import type { NextPageWithLayout } from '@/types/next';

type DbVenueWithOwner = DbVenue & {
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const searchParamsSchema = z.object({
  pagination: z
    .object({
      pageIndex: z.number().int().nonnegative(),
      pageSize: z.number().int().positive(),
    })
    .catch({ pageIndex: 0, pageSize: 10 }),
  isActive: z.coerce.boolean().optional().catch(undefined),
});

type UseColumnsProps = {
  t: TFunction;
};

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
      if (!res.ok) throw new Error('Failed to fetch logo');
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
          variant="secondary"
          size="sm"
          className="h-8 px-3 text-xs font-medium"
        >
          <Trans>View</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw]">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Trans>Loading</Trans>...
          </div>
        )}
        {!loading && url && (
          <div
            className="relative flex items-center justify-center p-4"
            style={{ height: '70vh' }}
          >
            <Image
              src={url}
              alt="Logo preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        {!loading && !url && (
          <div className="flex h-64 items-center justify-center text-gray-500">
            <Trans>Failed to load image</Trans>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const columnsHelper = createColumnHelper<DbVenueWithOwner>();

const useCreateColumns = ({
  t,
  selectedWorkspace,
}: UseColumnsProps & {
  selectedWorkspace: { id: string } | null;
}): ColumnDef<DbVenueWithOwner>[] => {
  return useMemo(
    () =>
      [
        columnsHelper.accessor('name', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Name')} />
          ),
        }),

        columnsHelper.accessor('description', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Description')} />
          ),
          cell: ({ row }) => {
            const { description } = row.original;
            return description ? (
              <span className="line-clamp-2" title={description}>
                {description}
              </span>
            ) : (
              '-'
            );
          },
        }),

        columnsHelper.accessor('city', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('City')} />
          ),
          cell: ({ row }) => row.original.city ?? '-',
        }),

        columnsHelper.accessor('country', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Country')} />
          ),
          cell: ({ row }) => row.original.country ?? '-',
        }),

        columnsHelper.accessor('address', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Address')} />
          ),
          cell: ({ row }) => row.original.address ?? '-',
        }),

        columnsHelper.accessor('isActive', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Status')} />
          ),
          cell: ({ row }) => {
            const { isActive } = row.original;
            return (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {isActive ? t('Active') : t('Inactive')}
              </span>
            );
          },
        }),

        columnsHelper.accessor('brand_color', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Brand Color')} />
          ),
          cell: ({ row }) => {
            const color = row.original.brand_color;
            return color ? (
              <div className="flex items-center gap-2">
                <div
                  className="size-5 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{color}</span>
              </div>
            ) : (
              '-'
            );
          },
        }),

        columnsHelper.display({
          id: 'owner',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Owner')} />
          ),
          cell: ({ row }) => {
            const { owner } = row.original;
            if (!owner) return '-';
            return (
              <div className="flex flex-col">
                <span className="font-medium">{owner.name}</span>
              </div>
            );
          },
        }),

        columnsHelper.accessor('logo_file', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Logo')} />
          ),
          cell: ({ row }) => {
            const logo = row.original.logo_file;
            return logo ? (
              <LogoPreviewButton logoKey={logo} />
            ) : (
              <span className="text-sm text-gray-500">No logo</span>
            );
          },
        }),
        columnsHelper.accessor('id', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Actions')} />
          ),
          cell: ({ row }) => {
            const { id, name } = row.original;
            return (
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">
                            <Trans>Actions</Trans>
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Trans>Actions</Trans>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/venues/manage/${id}`}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="size-4" />
                      <Trans>Manage Venue</Trans>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="p-0"
                  >
                    <QrInvitationModal
                      workspaceId={selectedWorkspace?.id ?? ''}
                      venueId={id}
                      venueName={name}
                      trigger={
                        <div className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5">
                          <QrCode className="size-4" />
                          <Trans>Generate QR Invitation</Trans>
                        </div>
                      }
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="p-0"
                  >
                    <QrCheckInModal
                      workspaceId={selectedWorkspace?.id ?? ''}
                      venueId={id}
                      venueName={name}
                      trigger={
                        <div className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5">
                          <QrCode className="size-4" />
                          <Trans>Generate Check-in QR</Trans>
                        </div>
                      }
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        }),
      ] as ColumnDef<DbVenue>[],
    [t, selectedWorkspace?.id]
  );
};

const VenuesPage: NextPageWithLayout = () => {
  const { selectedWorkspace } = useSessionUser();
  const { t } = useTranslation();
  const router = useRouter();

  const searchParams = useParsedSearchParams(searchParamsSchema);

  const { data, error, isLoading } = useGetVenues({
    workspaceId: selectedWorkspace?.id ?? '',
    pageIndex: searchParams.pagination.pageIndex,
    pageSize: searchParams.pagination.pageSize,
    isActive: searchParams.isActive,
  });

  const columns = useCreateColumns({ t, selectedWorkspace });

  const pageCount = data?.total
    ? Math.ceil(data.total / searchParams.pagination.pageSize)
    : 0;

  const handleFilterChange = (value: string | undefined): void => {
    const params = new URLSearchParams();
    params.set(
      'pagination',
      JSON.stringify({
        pageIndex: 0,
        pageSize: searchParams.pagination.pageSize,
      })
    );
    if (value !== undefined) {
      params.set('isActive', value);
    }
    router
      .push(`?${params.toString()}`, undefined, { shallow: true })
      .catch(() => {});
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        <Trans>Venues</Trans>
      </h1>
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
      <div className="mb-4">
        <DataTable
          columns={columns}
          data={(data?.items as unknown as DbVenueWithOwner[]) ?? []}
          loading={isLoading}
          error={formatZodiosError('getVenues', error)?.error}
          pagination={searchParams.pagination}
          pageCount={pageCount}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    </div>
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

export default VenuesPage;
