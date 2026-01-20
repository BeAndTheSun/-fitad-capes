import { selectVenueSchema } from '@meltstudio/zod-schemas';
import { z } from 'zod';

export const venueWithOwnerSchema = selectVenueSchema.extend({
  start_event_time: z.coerce.date().nullable().optional(),
  end_event_time: z.coerce.date().nullable().optional(),
  owner: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
});

export const updateVenueSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logo_file: z.string().optional(),
  brand_color: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
  start_event_time: z.coerce.date().optional(),
  end_event_time: z.coerce.date().optional(),
  phone_number: z.string().optional(),
  company_website: z.string().optional(),
  superfit_menu_link: z.string().optional(),
  social_media_page: z.string().optional(),
});
