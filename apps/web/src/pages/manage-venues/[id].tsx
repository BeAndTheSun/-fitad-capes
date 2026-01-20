import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import { Trans } from 'react-i18next';

import { useGetVenueById, useUpdateVenueById } from '@/client-common/sdk';
import type { VenueFormValues } from '@/components/venues/venue-form';
import { VenueForm } from '@/components/venues/venue-form';
import { useFileInput } from '@/hooks/use-file-input';
import { toast } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';

const ManageVenueRecord: React.FC<{ recordId: string }> = ({ recordId }) => {
  const { uploadFile } = useFileInput();

  const { isLoading, data, refetch } = useGetVenueById({
    venueId: recordId,
    enabled: true,
  });

  const updateVenue = useUpdateVenueById({
    params: {
      venueId: recordId,
    },
  });

  const handleSubmit = async (values: VenueFormValues): Promise<void> => {
    let uploadedKey = data?.logo_file ?? '';

    if (values.logo_file) {
      const { key } = await uploadFile(values.logo_file);
      uploadedKey = key;
    }

    await updateVenue
      .mutateAsync({
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
        start_event_time: values.event_date_range?.from,
        end_event_time: values.event_date_range?.to,
        superfit_menu_link: values.superfit_menu_link,
      })
      .then(async () => {
        await refetch();
        toast({
          title: 'Venue updated',
          variant: 'default',
        });
      })
      .catch(() => {
        toast({
          title: 'Failed to update venue',
          variant: 'destructive',
        });
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        <Trans>Manage Venue {data?.name}</Trans>
      </h1>
      <VenueForm
        data={data}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

const VenuesRecordPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const recordId = typeof id === 'string' ? id : '';

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

export default VenuesRecordPage;
