import {
  usePerformVenueCheckIn,
  useValidateVenueCheckIn,
} from '@meltstudio/client-common';
import type { VenueCheckInData } from '@meltstudio/ui';
import { VenueCheckInView } from '@meltstudio/ui';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback } from 'react';

import type { NextPageWithLayout } from '@/types/next';

const VenueCheckInPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { token } = router.query;

  const { data, isLoading, error } = useValidateVenueCheckIn(
    typeof token === 'string' ? token : '',
    typeof token === 'string'
  );
  const checkInMutation = usePerformVenueCheckIn();

  const handleCheckIn = useCallback(
    async (params: { token: string }) => {
      await checkInMutation.mutateAsync(params);
      // Redirect to my-venues on success
      await router.push('/my-venues');
    },
    [checkInMutation, router]
  );

  const handleCancel = useCallback(async () => {
    // Redirect to home
    await router.push('/');
  }, [router]);

  if (!token || typeof token !== 'string') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-destructive">Invalid check-in link</div>
      </div>
    );
  }

  // Extract error message from API error response
  const getErrorMessage = (): string | undefined => {
    if (!error) return undefined;

    // Type assertion for error response structure
    const apiError = error as { response?: { data?: { error?: string } } };
    return apiError?.response?.data?.error || 'Failed to validate check-in';
  };

  // Transform data for the component
  let validationData: VenueCheckInData | null = null;

  if (data) {
    validationData = {
      venue: data.venue,
      isActive: data.isActive,
      userStatus: data.userStatus,
      canCheckIn: data.canCheckIn,
      errorMessage: undefined,
    };
  } else if (error) {
    validationData = {
      venue: undefined,
      isActive: false,
      userStatus: null,
      canCheckIn: false,
      errorMessage: getErrorMessage(),
    };
  }

  return (
    <VenueCheckInView
      token={token}
      validationData={validationData}
      isValidating={isLoading}
      validationError={error}
      onCheckIn={handleCheckIn}
      onCancel={handleCancel}
      isCheckingIn={checkInMutation.isLoading}
      checkInError={checkInMutation.error}
    />
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

export default VenueCheckInPage;
