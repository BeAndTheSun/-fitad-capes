/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { DbNewFeatureFlag } from '@meltstudio/db';
import { DEFAULT_FEATURE_FLAGS } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { featureFlagsApi } from './def';

export const featureFlagsRouter = ctx.router(featureFlagsApi);

featureFlagsRouter.get('/:workspaceId/list', async (req, res) => {
  const { workspaceId } = req.params;

  const flagsGlobal = await db.globalFeatureFlags.findMany();

  const flags = await db.featureFlag.findMany({
    args: { where: { workspaceId } },
  });

  const globalFlagsMap = new Map();
  flagsGlobal.forEach((globalFlag) => {
    globalFlagsMap.set(globalFlag.flag, globalFlag);
  });
  const releasedFlags = flags
    .filter((flag) => {
      const globalFlag = globalFlagsMap.get(flag.flag);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return globalFlag && globalFlag.released === true;
    })
    .map((flag) => {
      const globalFlag = globalFlagsMap.get(flag.flag);
      return {
        ...flag,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        allowWorkspaceControl: globalFlag.allowWorkspaceControl,
      };
    });

  return res.status(200).json({ flags: releasedFlags });
});

featureFlagsRouter.put('/toggle', async (req, res) => {
  // Auth
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Toggle
  const { id, released } = req.body;
  const flag = await db.featureFlag.toggle(id, released);

  if (!flag) return res.status(404).json({ error: 'Feature flag not found' });

  return res.status(200).json({ flag });
});

featureFlagsRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.body;

  const globalFlags = await db.globalFeatureFlags.findMany();
  const globalFlagMap = new Map(globalFlags.map((f) => [f.flag, f.id]));

  await Promise.all(
    DEFAULT_FEATURE_FLAGS.map(async (defaultFlag) => {
      const globalId = globalFlagMap.get(defaultFlag.flag);
      if (!globalId) {
        return res.status(500).send({
          error: `GlobalFeatureFlag with flag "${defaultFlag.flag}" not found`,
        });
      }
      const flagData: DbNewFeatureFlag = {
        flag: defaultFlag.flag,
        description: defaultFlag.description,
        released: defaultFlag.released,
        workspaceId,
        globalFeatureFlagId: globalId,
      };

      return db.featureFlag.create({
        data: flagData,
        activityStreamData: { userId: req.auth?.user.id ?? '', workspaceId },
      });
    })
  );

  return res.status(201).json({ success: true });
});

featureFlagsRouter.delete('/:workspaceId/delete', async (req, res) => {
  // Auth
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Delete
  const { id } = req.body;
  const { workspaceId } = req.params;

  await db.featureFlag.delete({
    pk: id,
    activityStreamData: { userId: req.auth.user.id, workspaceId, recordId: id },
  });

  return res.status(200).json({ success: true });
});

featureFlagsRouter.post('/:workspaceId/users/add', async (req, res) => {
  // Auth
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  // Add
  const userFlag = await db.userFeatureFlag.create({
    data: req.body,
    activityStreamData: { userId: req.auth.user.id, workspaceId },
  });

  return res.status(201).send(userFlag);
});

featureFlagsRouter.get(
  '/:workspaceId/:featureFlagId/users',
  async (req, res) => {
    // Auth
    if (req.auth == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const flagId = req.params.featureFlagId;

    if (!flagId) {
      return res.status(400).send({ error: 'Flag ID is required' });
    }

    // Get user flags
    const data = await db.userFeatureFlag.findManyByFeatureFlagId(flagId);

    return res.status(200).json({ data });
  }
);

featureFlagsRouter.patch('/users/toggle', async (req, res) => {
  // Auth
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Toggle
  const { featureFlagId, userId, released } = req.body;
  const updatedFlag = await db.userFeatureFlag.toggle(
    userId,
    featureFlagId,
    released
  );

  return res.status(200).send(updatedFlag);
});

featureFlagsRouter.delete('/:workspaceId/users/delete', async (req, res) => {
  // Auth
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;

  // Delete
  const { featureFlagId, userId } = req.body;
  await db.userFeatureFlag.deleteByUser(userId, featureFlagId, {
    userId,
    workspaceId,
  });

  return res.status(200).json({ success: true });
});
