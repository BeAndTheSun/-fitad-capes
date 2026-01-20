import { createSchemasForTable, dbSchemas } from '@meltstudio/db';
import { z } from 'zod';

export const {
  insert: insertVenueSchema,
  select: selectVenueSchema,
  sorting: sortingVenueSchema,
} = createSchemasForTable(dbSchemas.venue, {
  insert: {
    id: (s) => s.uuid(),
    ownerId: (s) => s.nullable(),
    phone_number: (s) => s.nullable(),
    company_website: (s) => s.nullable(),
    superfit_menu_link: (s) => s.nullable(),
    social_media_page: (s) => s.nullable(),
    start_event_time: () => z.coerce.date().nullable(),
    end_event_time: () => z.coerce.date().nullable(),
  },
  select: {
    id: (s) => s.uuid(),
    logo_file: (s) => s.nullable(),
    brand_color: (s) => s.nullable(),
    address: (s) => s.nullable(),
    city: (s) => s.nullable(),
    country: (s) => s.nullable(),
    description: (s) => s.nullable(),
    ownerId: (s) => s.nullable(),
    invitation_token: (s) => s.nullable(),
    phone_number: (s) => s.nullable(),
    company_website: (s) => s.nullable(),
    superfit_menu_link: (s) => s.nullable(),
    social_media_page: (s) => s.nullable(),
    start_event_time: () => z.coerce.date().nullable(),
    end_event_time: () => z.coerce.date().nullable(),
    checking_token: (s) => s.nullable(),
    createdAt: (s) => s.nullable(),
    isActive: (s) => s.nullable(),
    name: (s) => s.nullable(),
  },
});

export type DbVenue = z.infer<typeof selectVenueSchema>;
export type DbNewVenue = z.infer<typeof insertVenueSchema>;
