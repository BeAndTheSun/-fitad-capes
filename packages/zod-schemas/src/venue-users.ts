import { z } from 'zod';

export const selectVenueUsersSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  venueId: z.string().uuid(),
  comments: z.string().nullable().optional(),
});

export const insertVenueUsersSchema = selectVenueUsersSchema;
