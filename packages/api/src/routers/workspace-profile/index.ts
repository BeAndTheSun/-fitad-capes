import { IntegrationHooks } from '@meltstudio/common';
import { ActivityActions, UserRoleEnum } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { inviteMultipleMembersToWorkspace } from '@/api/services/user';

import { workspaceProfileApiDef } from './def';

export const workspaceProfileRouter = ctx.router(workspaceProfileApiDef);

workspaceProfileRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Check sender
  const user = await db.user.findUniqueByEmail(req.auth.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { workspaceId, members } = req.body;

  const existingWorkspace = await db.workspace.findUniqueByPk(workspaceId);
  const existingProfile =
    await db.workspaceProfile.findByWorkspaceId(workspaceId);

  if (!existingWorkspace) {
    return res.status(409).json({
      error: "Workspace doesn't exists for this workspaceId",
    });
  }

  if (existingProfile) {
    return res.status(409).json({
      error: 'Profile already exists for this workspaceId',
    });
  }

  // this can be handled by zod, but was added here to showcase the workspace creation wizard getting an error on submission
  if (req.body.members.length === 0) {
    return res.status(400).json({
      error: 'No members added to the workspace',
    });
  }

  const newProfile = await db.workspaceProfile.create({
    data: req.body,
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId,
    },
  });

  if (req.body.includeCreatorInWorkspace) {
    await db.userWorkspaces.create({
      data: {
        userId: user.id,
        workspaceId,
        role: UserRoleEnum.ADMIN,
      },
      activityStreamData: {
        userId: req.auth.user.id,
        workspaceId,
      },
    });
  }

  await inviteMultipleMembersToWorkspace({
    workspaceId,
    senderName: user.name,
    members,
  });

  const eventType = ActivityActions.CREATE;

  await Promise.all(
    members.map((member) =>
      IntegrationHooks.onAddUser(member, workspaceId, eventType)
    )
  );

  return res.status(201).json(newProfile);
});

workspaceProfileRouter.get('/:workspaceId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  if (!workspaceId) {
    return res.status(400).send({ error: 'WorkspaceId is required' });
  }
  const profile = await db.workspaceProfile.findByWorkspaceId(workspaceId);

  if (!profile) {
    return res.status(404).json({ error: 'Workspace profile not found' });
  }

  return res.status(200).json(profile);
});

workspaceProfileRouter.put('/:workspaceId/update', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  const existingProfile =
    await db.workspaceProfile.findByWorkspaceId(workspaceId);
  if (!existingProfile) {
    return res.status(404).json({ error: 'Workspace profile not found' });
  }

  const updatedData = {
    ...existingProfile,
    ...req.body,
  };

  const updatedProfile = await db.workspaceProfile.update({
    pk: workspaceId,
    data: updatedData,
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId,
      recordId: workspaceId,
    },
  });

  return res.status(200).json(updatedProfile);
});

workspaceProfileRouter.delete('/:workspaceId/delete', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  const existingProfile =
    await db.workspaceProfile.findByWorkspaceId(workspaceId);
  if (!existingProfile) {
    return res.status(404).json({ error: 'Workspace profile not found' });
  }

  await db.workspaceProfile.delete({
    pk: workspaceId,
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId,
      recordId: workspaceId,
    },
  });

  return res.status(200).json({ success: true });
});
