/* eslint-disable import/no-extraneous-dependencies */
import {
  formatZodiosError,
  useGetMembersOfVenue,
  useGetRecord,
} from '@meltstudio/client-common';
import {
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@meltstudio/theme';
import { QrCode, Settings, Users } from 'lucide-react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { ErrorMessageBox } from '@/components/error-message-box';
import { useSessionUser } from '@/components/user/user-context';
import { CheckInTab } from '@/components/venues/tabs/check-in-tab';
import { ParticipantsTab } from '@/components/venues/tabs/participants-tab';
import { VenueSettingsTab } from '@/components/venues/tabs/settings-tab';
import type { DbVenue } from '@/db/schema';
import { useTabs } from '@/hooks/use-tabs';
import type { NextPageWithLayout } from '@/types/next';

type VenueManagementTab = 'participants' | 'checkin' | 'details';

const VALID_TABS: readonly VenueManagementTab[] = [
  'participants',
  'checkin',
  'details',
];

const DEFAULT_TAB: VenueManagementTab = 'participants';

const VenueManagePage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const venueId = typeof id === 'string' ? id : '';

  const { selectedWorkspace } = useSessionUser();
  const { t } = useTranslation();
  const { toast } = useToast();

  const { currentTab, setTab: setTabBase } = useTabs({
    validTabs: VALID_TABS,
    defaultTab: DEFAULT_TAB,
  });

  const setTab = (tab: VenueManagementTab): void => {
    setTabBase(tab).catch((err: Error) => {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    });
  };

  const {
    data: venueData,
    error: venueError,
    isLoading: venueLoading,
  } = useGetRecord('venue', venueId);

  const {
    data: participantsData,
    refetch: refetchParticipants,
    isLoading: participantsLoading,
  } = useGetMembersOfVenue({
    venueId,
    enabled: !!venueId,
  });

  const venue = venueData as DbVenue | undefined;
  const participants = participantsData ?? [];

  if (!venueId || !selectedWorkspace) {
    return <ErrorMessageBox error="Invalid venue or workspace" />;
  }

  if (venueLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const errorString = formatZodiosError('getRecord', venueError)?.error;
  if (errorString) {
    return <ErrorMessageBox error={errorString} />;
  }

  if (!venue) {
    return <ErrorMessageBox error="Venue not found" />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{venue.name}</h1>
        <p className="text-muted-foreground">
          {t('Manage venue participants and settings')}
        </p>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) => setTab(value as typeof currentTab)}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="participants" className="gap-2">
            <Users className="size-4" />
            <Trans>Participants</Trans>
          </TabsTrigger>
          <TabsTrigger value="checkin" className="gap-2">
            <QrCode className="size-4" />
            <Trans>Check-In</Trans>
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2">
            <Settings className="size-4" />
            <Trans>Details</Trans>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <ParticipantsTab
            venueId={venueId}
            venueName={venue.name}
            workspaceId={selectedWorkspace.id}
            participants={participants}
            loading={participantsLoading}
            onRefetch={() => refetchParticipants()}
          />
        </TabsContent>

        <TabsContent value="checkin">
          <CheckInTab
            venue={venue}
            workspaceId={selectedWorkspace.id}
            onRefetch={() => refetchParticipants()}
          />
        </TabsContent>

        <TabsContent value="details">
          <VenueSettingsTab venue={venue} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale, [
      'translation',
    ]);

    props = { ...props, ...translations };
  }

  return { props };
};

export default VenueManagePage;
