import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@meltstudio/theme';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';

import type { DbVenue } from '@/db/schema';

type VenueSettingsTabProps = {
  venue: DbVenue;
};

export const VenueSettingsTab: FC<VenueSettingsTabProps> = ({ venue }) => {
  const { t } = useTranslation();

  const formatDateTime = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('Venue Details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('Name')}
            </label>
            <p className="text-sm">{venue.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('Description')}
            </label>
            <p className="text-sm">{venue.description ?? '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('Address')}
            </label>
            <p className="text-sm">{venue.address ?? '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('City')}
              </label>
              <p className="text-sm">{venue.city ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('Country')}
              </label>
              <p className="text-sm">{venue.country ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Event Times')}</CardTitle>
          <CardDescription>{t('Read-only event schedule')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('Start Time')}
            </label>
            <p className="text-sm">{formatDateTime(venue.start_event_time)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('End Time')}
            </label>
            <p className="text-sm">{formatDateTime(venue.end_event_time)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('Status')}
            </label>
            <p className="text-sm">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  venue.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {venue.isActive ? t('Active') : t('Inactive')}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
