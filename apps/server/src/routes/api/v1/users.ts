import { Router } from 'express';

import { db } from '@/utils/db';

export const usersRouter = Router();

usersRouter.get('/', async (_, res) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  res.status(200).json({ results: users });
});
