import type { UserRoleEnum } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { userWorkspacesApiDef } from './def';

export const userWorkspacesRouter = ctx.router(userWorkspacesApiDef);

userWorkspacesRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId, email, role } = req.body;

  const existingUser = await db.user.findUniqueByEmail(email);
  if (!existingUser) {
    return res.status(404).send({ error: 'User not exist' });
  }

  const existingUserWorkspace =
    await db.userWorkspaces.findByUserIdAndWorkspaceId(
      existingUser.id,
      workspaceId
    );

  if (existingUserWorkspace) {
    return res.status(200).json(existingUserWorkspace);
  }

  const data = await db.userWorkspaces.create({
    data: {
      userId: existingUser.id,
      workspaceId,
      role: role as UserRoleEnum,
    },
    activityStreamData: {
      userId: existingUser.id,
      workspaceId,
    },
  });

  await db.user.handleAlgoliaSaveByPk(existingUser.id);

  return res.status(201).json(data);
});
