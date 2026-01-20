import { formatZodiosError, useCreateRecord } from '@meltstudio/client-common';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

import {
  useGetModelRelation,
  useGetVenueById,
  useUpdateVenueById,
} from '@/client-common/sdk';
import type { VenueFormValues } from '@/components/venues/venue-form';
import { VenueForm } from '@/components/venues/venue-form';
import { useFileInput } from '@/hooks/use-file-input';
import { toast } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';

const ManageVenueRecord: React.FC<{ recordId?: string }> = ({ recordId }) => {
  const { t } = useTranslation();
  const { uploadFile } = useFileInput();
  const router = useRouter();

  const { data: userData } = useGetModelRelation({
    model: 'venue',
    relation: 'users',
  });

  const isCreate = !recordId;

  const { isLoading, data, refetch } = useGetVenueById({
    venueId: recordId ?? '',
    enabled: !!recordId,
  });

  const updateVenue = useUpdateVenueById({
    params: {
      venueId: recordId ?? '',
    },
  });

  const createRecord = useCreateRecord({
    params: { model: 'venue' },
  });

  const handleSubmit = async (values: VenueFormValues): Promise<void> => {
    let uploadedKey = data?.logo_file ?? '';

    if (values.logo_file) {
      const { key } = await uploadFile(values.logo_file);
      uploadedKey = key;
    }

    const venueData = {
      address: values.address,
      brand_color: values.brand_color,
      city: values.city,
      company_website: values.company_website,
      country: values.country,
      description: values.description,
      isActive: values.isActive,
      logo_file: uploadedKey,
      name: values.name,
      phone_number: values.phone_number,
      social_media_page: values.social_media_page,
      start_event_time: new Date(values.event_date_range?.from ?? ''),
      end_event_time: new Date(values.event_date_range?.to ?? ''),
      superfit_menu_link: values.superfit_menu_link,
      ownerId: values.ownerId,
    };

    if (isCreate) {
      createRecord.mutate(
        {
          data: venueData,
        },
        {
          onSuccess: async () => {
            toast({
              title: t('Venue created'),
              variant: 'default',
            });
            await router.push('/super-admin/venue');
          },
          onError: (zodiosError) => {
            const e = formatZodiosError('createRecord', zodiosError, {
              method: 'post',
              path: `/api/admin/:model`,
            });
            toast({
              title: e?.error ?? t('Failed to create venue'),
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      await updateVenue
        .mutateAsync(venueData)
        .then(async () => {
          await refetch();
          toast({
            title: t('Venue updated'),
            variant: 'default',
          });
        })
        .catch(() => {
          toast({
            title: t('Failed to update venue'),
            variant: 'destructive',
          });
        });
    }
  };

  if (isLoading && !isCreate) {
    return <div>Loading...</div>;
  }

  if (!data && !isCreate) {
    return <div>Not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {isCreate ? (
          <Trans>Create Venue</Trans>
        ) : (
          <Trans>Manage Venue {data?.name}</Trans>
        )}
      </h1>
      <VenueForm
        data={data}
        handleSubmit={handleSubmit}
        isLoading={isCreate ? createRecord.isLoading : isLoading}
        users={userData}
        showOwnerSelect
      />
    </div>
  );
};

const ManageVenueRecordPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const recordId = typeof id === 'string' ? id : undefined;

  return <ManageVenueRecord recordId={recordId} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default ManageVenueRecordPage;
