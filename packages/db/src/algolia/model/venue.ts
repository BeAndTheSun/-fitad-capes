import { venue } from '@/db/schema';

import { algoliaModel } from './base';

export const venues = algoliaModel({
  table: venue,
  pkColumn: venue.id,
  config: {
    id: true,
    name: { canFilter: true },
    description: true,
    logo_file: true,
    brand_color: true,
    address: true,
    city: { canFilter: true },
    country: { canFilter: true },
    isActive: { canFilter: true },
    start_event_time: true,
    end_event_time: true,
    checking_token: true,
    createdAt: { canSort: true },
  },
});
