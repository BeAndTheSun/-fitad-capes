import { ActivityActions } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { workspaceProfileApiDef } from './def';
import {
  ensureCreatorInWorkspace,
  processMembers,
  triggerIntegrationHooks,
} from './utils';

export const workspaceProfileRouter = ctx.router(workspaceProfileApiDef);

workspaceProfileRouter.post('/', async (req, res) => {
  const { auth } = req;
  if (auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const user = await db.user.findUniqueByEmail(auth.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const {
    workspaceId,
    description,
    instagramUrl,
    facebookUrl,
    companyUrl,
    linkedinUrl,
    members,
    includeCreatorInWorkspace,
  } = req.body;

  if (members.length === 0) {
    return res.status(400).json({
      error: 'No members added to the workspace',
    });
  }

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
  const newProfile = await db.workspaceProfile.create({
    data: {
      workspaceId,
      description,
      instagramUrl,
      facebookUrl,
      companyUrl,
      linkedinUrl,
    },
    activityStreamData: {
      userId: auth.user.id,
      workspaceId,
    },
  });

  await processMembers({
    workspaceId,
    members,
    senderName: user.name,
    senderId: auth.user.id,
  });

  await ensureCreatorInWorkspace({
    workspaceId,
    creatorId: user.id,
    senderId: auth.user.id,
    includeCreator: includeCreatorInWorkspace,
  });

  await triggerIntegrationHooks({
    workspaceId,
    members,
    eventType: ActivityActions.CREATE,
  });

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
