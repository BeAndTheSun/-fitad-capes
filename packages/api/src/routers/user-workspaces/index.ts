import { UserRoleEnum } from '@meltstudio/types';

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

userWorkspacesRouter.get(
  '/workspace/:workspaceId/trainer',
  async (req, res) => {
    if (req.auth == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { workspaceId } = req.params;

    if (!workspaceId) {
      return res.status(400).send({ error: 'Workspace ID is required' });
    }

    // Verify workspace exists
    const workspace = await db.workspace.findUniqueByPk(workspaceId);
    if (!workspace) {
      return res.status(404).send({ error: 'Workspace not found' });
    }

    // Get all users in the workspace with their user details using the query API
    // Use the workspace model's findUniqueByPkAdmin method which loads relations
    // or use a direct query through the workspace model
    const workspaceWithUsers = await db.workspace.findUniqueByPkAdmin(
      workspaceId,
      true
    );

    if (!workspaceWithUsers || !workspaceWithUsers.users) {
      return res.status(404).send({ error: 'Workspace users not found' });
    }

    // Find the trainer (admin role) from the workspace users
    const trainerWorkspace = workspaceWithUsers.users.find(
      (uw) => (uw.role as UserRoleEnum) === UserRoleEnum.ADMIN && uw.user
    );

    if (!trainerWorkspace || !trainerWorkspace.user) {
      return res.status(404).send({ error: 'Trainer not found' });
    }

    return res.status(200).json({
      id: trainerWorkspace.user.id,
      name: trainerWorkspace.user.name,
      email: trainerWorkspace.user.email,
    });
  }
);

userWorkspacesRouter.get(
  '/workspace/:workspaceId/member-participation',
  async (req, res) => {
    if (req.auth == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { workspaceId } = req.params;
    const userId = req.auth.user.id;

    if (!workspaceId) {
      return res.status(400).send({ error: 'Workspace ID is required' });
    }

    // Verify workspace exists
    const workspace = await db.workspace.findUniqueByPk(workspaceId);
    if (!workspace) {
      return res.status(404).send({ error: 'Workspace not found' });
    }

    // Get user workspace relationship
    const userWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
      userId,
      workspaceId
    );

    if (!userWorkspace) {
      return res.status(404).send({
        error: 'User is not a member of this workspace',
      });
    }

    // Get user details
    const user = await db.user.findUniqueByPk(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    return res.status(200).json({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      role: userWorkspace.role,
      email: user.email,
      name: user.name,
    });
  }
);
