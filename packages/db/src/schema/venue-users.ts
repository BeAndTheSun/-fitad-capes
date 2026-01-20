import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { users } from './users';
import { venue } from './venue';

export const venueUserStatusEnum = pgEnum('venue_user_status', [
  'joined',
  'checking',
  'completed',
  'failed',
]);

export const venueUsers = pgTable('venue_users', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  venueId: uuid()
    .references(() => venue.id, { onDelete: 'cascade' })
    .notNull(),
  comments: text(),
  status: venueUserStatusEnum().notNull().default('joined'),
});

export type DbVenueUser = typeof venueUsers.$inferSelect;
export type DbVenueUserExtended = InferResultType<
  'venueUsers',
  { user: true; venue: true }
>;

export type DbNewVenueUser = typeof venueUsers.$inferInsert;
export type DbUpdateVenueUserSorting = TableSorting<DbVenueUser>;

export type DbVenueUserWithRelations = DbVenueUser & {
  user: {
    id: string;
    email: string;
    name: string;
  };
  venue: {
    id: string;
  };
};
