import { IntegrationHooks } from '@meltstudio/common';
import type { UserRoleEnum } from '@meltstudio/types';
import { ActivityActions } from '@meltstudio/types';
import { isAfter } from 'date-fns';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { inviteMemberToWorkspace } from '@/api/services/user';
import { createMemberInWorkspace } from '@/api/services/user/create-member-in-workspace';
import { createNewUser } from '@/api/utils/session';

import { usersApiDef } from './def';

export const usersRouter = ctx.router(usersApiDef);

usersRouter.post('/:workspaceId/create-member', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;
  const { name, email, password } = req.body;

  try {
    const result = await createMemberInWorkspace(workspaceId, {
      name,
      email,
      password,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create member' });
  }
});

usersRouter.get('/me', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const user = await db.user.findUniqueByEmailWithPassword(req.auth.user.email);

  if (user) {
    const isVenueOwner = await db.venue.isOwner(user.id);
    return res.status(200).json({ ...user, isVenueOwner });
  }
  return res.status(404).json({ error: 'User not found' });
});

usersRouter.put('/:workspaceId/me', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  await db.user.update({
    pk: req.auth.user.id,
    data: req.body,
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId,
      recordId: req.auth.user.id,
    },
  });

  return res.status(204).end();
});

usersRouter.get('/list', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { query } = req.query;
  const { filters, pagination, sorting } = query ?? {};

  const total = await db.user.count({ ...filters });

  // TODO: Remove parsing once query params sanitize is handled
  const pageIndex = pagination?.pageIndex ? Number(pagination?.pageIndex) : 0;
  const limit = pagination?.pageSize ? Number(pagination?.pageSize) : total; // If limit is passed as 0 no users will be returned
  const offset = limit > 0 ? pageIndex * limit : 0;

  const pageCount = limit ? Math.ceil(total / limit) : total;

  const users = await db.user.findMany({
    args: {
      pagination: { limit, offset },
      where: { ...filters },
      sorting,
    },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
      is2faEnabled: true,
      profileImage: true,
      isSuperAdmin: true,
      gtmId: true,
    },
  });

  if (users) {
    return res.status(200).json({
      items: users,
      total,
      limit,
      offset,
      pageCount,
    });
  }

  return res.status(404).json({ error: 'Users not found' });
});

usersRouter.delete('/:workspaceId/remove', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  const { id } = req.body;

  await db.user.delete({
    pk: id,
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId,
      recordId: id,
    },
  });

  return res.status(200).json({ success: true });
});

usersRouter.put('/:workspaceId/role', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;
  const { userId, role } = req.body;

  await db.userWorkspaces.updateRoleMultipleUsersInWorkspace(
    [userId],
    workspaceId as string,
    role
  );

  await db.user.handleAlgoliaSaveByPk(userId);

  return res.status(200).end();
});

usersRouter.post('/:workspaceId/invite', async (req, res) => {
  // Unauthorized
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Check sender
  const user = await db.user.findUniqueByEmail(req.auth.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Checks if user to be invited exists
  const { workspaceId } = req.params;
  const { email, role } = req.body;

  await inviteMemberToWorkspace({
    email,
    role,
    workspaceId,
    senderName: user.name,
  });

  const eventType = ActivityActions.INVITE;

  await IntegrationHooks.onAddUser({ email, role }, workspaceId, eventType);

  return res.status(200).json({ success: true });
});

usersRouter.post('/invite/accept', async (req, res) => {
  const { token, ...params } = req.body;
  const invitation = await db.memberInvitations.findByToken(token);

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (invitation.userId) {
    return res.status(400).json({ error: 'Invitation already used' });
  }

  if (!isAfter(invitation.expiresAt, new Date())) {
    return res.status(400).json({ error: 'Invitation expired' });
  }

  const existingUser = await db.user.findUniqueByEmail(invitation.email);
  let user = null;

  if (existingUser) {
    user = existingUser;

    const existingUserWorkspace =
      await db.userWorkspaces.findByUserIdAndWorkspaceId(
        existingUser?.id,
        invitation.workspaceId
      );

    if (!existingUserWorkspace) {
      await db.userWorkspaces.create({
        data: {
          userId: user.id,
          workspaceId: invitation.workspaceId,
          role: invitation.role as UserRoleEnum,
        },
        activityStreamData: {
          userId: user.id,
          workspaceId: invitation.workspaceId,
        },
      });

      await db.user.handleAlgoliaSaveByPk(user.id);
    }
  } else {
    const { name, password } = params;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    user = await createNewUser({
      email: invitation.email,
      role: invitation.role as UserRoleEnum,
      workspaceId: invitation.workspaceId,
      name,
      password,
    });
  }

  await db.memberInvitations.update({
    pk: invitation.id,
    data: { userId: user.id },
    activityStreamData: {
      userId: user.id,
      workspaceId: invitation.workspaceId,
      recordId: invitation.id,
    },
  });
  const workspace = await db.workspace.findUniqueByPk(invitation.workspaceId);

  if (!workspace) {
    return res.status(404).json({ error: 'Invitation workspace not found' });
  }

  return res.status(201).json({
    success: true,
    user: { id: user.id },
    workspaceId: invitation.workspaceId,
    name: workspace?.name,
  });
});

usersRouter.get('/invite/get', async (req, res) => {
  const { token } = req.query;

  const invitation = await db.memberInvitations.findByToken(token);

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  const user = await db.user.findUniqueByEmail(invitation.email);
  const workspace = await db.workspace.findUniqueByPk(invitation.workspaceId);

  if (!workspace) {
    return res.status(404).json({ error: 'Invitation workspace not found' });
  }

  return res
    .status(200)
    .json({ ...invitation, workspace: workspace.name, isNewUser: !user });
});

usersRouter.get('/:workspaceId/members', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  const members = await db.user.getWorkspaceMembers(workspaceId);

  return res.status(200).json(members);
});
