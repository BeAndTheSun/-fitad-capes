import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import { baseFields } from './base';
import { users } from './users';

export const personalInfo = pgTable('personal_info', {
  ...baseFields,
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  full_name: varchar({ length: 256 }),
  phone_number: varchar({ length: 50 }),
  fitness_goal: varchar({ length: 256 }),
  sponsoring: varchar({ length: 256 }),
});

export type DbPersonalInfo = typeof personalInfo.$inferSelect;
export type DbPersonalInfoExtended = InferResultType<
  'personalInfo',
  {
    user: true;
  }
>;

export type DBUserWithPersonalInfo = InferResultType<
  'users',
  {
    personalInfo: true;
  }
>;
