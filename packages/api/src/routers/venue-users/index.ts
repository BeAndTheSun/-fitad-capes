import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { addMemberToVenue } from '@/api/services/venues';

import { venueUsersApiDef } from './def';

export const venueUsersRouter = ctx.router(venueUsersApiDef);

venueUsersRouter.post('/:venueId/create', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { venueId } = req.params;
  const { comments, userId } = req.body;
  if (!venueId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await addMemberToVenue(venueId, {
      userId,
      comments: comments || '',
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create member' });
  }
});

venueUsersRouter.get('/:venueId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { venueId } = req.params;
  if (!venueId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.venueUsers.getAllByVenueId(venueId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get members' });
  }
});

venueUsersRouter.delete('/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.venueUsers.deleteById(id);
    return res.status(200).json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete member' });
  }
});
