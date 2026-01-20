import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields } from './base';
import { users } from './users';

export const venue = pgTable('venue', {
  ...baseFields,
  name: varchar({ length: 256 }).notNull(),
  description: text(),
  logo_file: varchar({ length: 256 }),
  brand_color: varchar({ length: 7 }),
  address: varchar({ length: 256 }),
  city: varchar({ length: 128 }),
  country: varchar({ length: 128 }),
  ownerId: uuid().references(() => users.id, { onDelete: 'set null' }),
  invitation_token: varchar({ length: 256 }).unique(),
  isActive: boolean().notNull().default(false),
  start_event_time: timestamp(),
  end_event_time: timestamp(),
  checking_token: varchar({ length: 256 }).unique(),
  phone_number: varchar({ length: 128 }),
  company_website: varchar({ length: 256 }),
  superfit_menu_link: varchar({ length: 256 }),
  social_media_page: varchar({ length: 256 }),
});

export type DbVenue = typeof venue.$inferSelect;
export type DbVenueExtended = InferResultType<'venue', { owner: true }>;
export type DbNewVenue = typeof venue.$inferInsert;
export type DbVenueSorting = TableSorting<DbVenue>;
