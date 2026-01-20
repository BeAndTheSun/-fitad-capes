import { db } from '@/api/db';

export const addMemberToVenue = async (
  venueId: string,
  userParams: { userId: string; comments: string }
): Promise<{ isNew: boolean; addedToVenue: boolean }> => {
  const { userId, comments } = userParams;

  // Check if venue exists and is active
  const venue = await db.venue.findUniqueByPk(venueId);
  if (!venue) {
    throw new Error('Venue not found');
  }

  if (!venue.isActive) {
    throw new Error('Cannot add participants to inactive venue');
  }

  await db.venueUsers.create({
    data: {
      venueId,
      userId,
      comments,
    },
  });

  return { isNew: true, addedToVenue: true };
};
