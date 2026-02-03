import type { DbModelMap } from '@meltstudio/db/src/models/db';
import { sendEmailTemplate } from '@meltstudio/mailing';
import { hashPassword } from '@meltstudio/server-common';
import type { RowEmbeddingData } from '@meltstudio/types';
import { insertModelSchemas } from '@meltstudio/zod-schemas';
import { z } from 'zod';

import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { adminApiDef } from './def';

function parseMaybeJson<T>(value: unknown): T | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  if (typeof value === 'object') return value as T;
  return undefined;
}

function parseIsActive(input: unknown): boolean | undefined {
  if (typeof input === 'string') {
    if (input === 'true') return true;
    if (input === 'false') return false;
    return undefined;
  }
  if (typeof input === 'boolean') {
    return input;
  }
  return undefined;
}

export const adminRouter = ctx.router(adminApiDef);

adminRouter.get('/:model', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  // check if the model exists
  if (!(modelName in db.models)) {
    return res.status(404).json({ error: 'Model not found' });
  }

  const model = db.getModel(modelName);

  if (!model) {
    return res.status(404).json({ error: 'Model not found' });
  }

  const rawQuery = (req.query as { query?: unknown }).query;
  const parsedQuery = parseMaybeJson<{
    filters?: unknown;
    pagination?: unknown;
  }>(rawQuery);

  const rawFilters =
    parsedQuery?.filters ?? (req.query as { filters?: unknown }).filters;
  const filters =
    parseMaybeJson<{ search?: unknown; isActive?: unknown }>(rawFilters) || {};

  const searchFilter =
    typeof filters.search === 'string' ? filters.search : undefined;

  const rawPagination =
    parsedQuery?.pagination ??
    (req.query as { pagination?: unknown }).pagination;
  const pagination =
    parseMaybeJson<{ pageIndex?: unknown; pageSize?: unknown }>(
      rawPagination
    ) || {};

  const pageIndex = Number(pagination?.pageIndex ?? 0);
  const pageSize = Number(pagination?.pageSize ?? 10);

  try {
    let items: unknown[] = [];
    let total = 0;

    switch (modelName) {
      case 'users': {
        const usersResult = await db.user.findAllUsers({
          filters: {
            search: searchFilter,
          },
          pagination: { pageIndex, pageSize },
        });
        items = usersResult.items;
        total = usersResult.total;
        break;
      }

      case 'workspace': {
        const workspaceResult = await db.workspace.findAllWorkspaces({
          filters: {
            search: searchFilter,
          },
          pagination: { pageIndex, pageSize },
        });
        items = workspaceResult.items;
        total = workspaceResult.total;
        break;
      }

      case 'userWorkspaces': {
        const userWorkspacesResult =
          await db.userWorkspaces.findAllUserWorkspaces({
            filters: {
              search: searchFilter,
            },
            pagination: { pageIndex, pageSize },
          });
        items = userWorkspacesResult.items;
        total = userWorkspacesResult.total;
        break;
      }
      case 'venue': {
        const isActiveFilter = parseIsActive(filters.isActive);
        const venueResult = await db.venue.findAllVenues({
          filters: {
            search: searchFilter,
            isActive: isActiveFilter,
          },
          pagination: { pageIndex, pageSize },
        });
        items = venueResult.items;
        total = venueResult.total;
        break;
      }
      // New case for globalFeatureFlags model
      // We are not implementing pagination or filters for this model as per requirements
      case 'globalFeatureFlags': {
        const globalFeatureFlags = await db.globalFeatureFlags.findMany();
        const result = {
          items: globalFeatureFlags,
          total: globalFeatureFlags.length,
          limit: 0,
          offset: 0,
          pageCount: 0,
          currentPage: 0,
        };
        return res.status(200).json(result);
      }

      default:
        return res.status(400).json({ error: 'Unsupported model' });
    }

    const pageCount = pageSize === 0 ? 1 : Math.ceil(total / pageSize);
    const limit = pageSize === 0 ? total : pageSize;
    const offset = pageSize === 0 ? 0 : pageIndex * pageSize;

    return res.status(200).json({
      items,
      total,
      limit,
      offset,
      pageCount,
      currentPage: pageIndex,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/:model/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);
  if (model) {
    const record = await model.findUniqueByPkAdmin(req.params.id, true);
    if (record) {
      return res.status(200).json(record);
    }
  }
  return res.status(404).json({ error: 'Record not found' });
});

adminRouter.put('/:model/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);

  if (model) {
    const schema = insertModelSchemas[modelName].extend({
      password: z.string().min(8).or(z.literal('')).nullable().optional(),
    });

    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    try {
      // Validate and parse the request body
      const parsedBody = schema.parse(req.body.data);
      if (
        'password' in parsedBody &&
        typeof parsedBody.password === 'string' &&
        parsedBody.password !== ''
      ) {
        parsedBody.password = await hashPassword(parsedBody.password);
      } else if ('password' in parsedBody) {
        delete parsedBody.password;
      }

      const record = await model.updateByAdmin({
        pk: req.params.id,
        data: parsedBody,
        activityStreamData: {
          userId: req.auth.user.id,
          workspaceId: null,
          recordId: req.params.id,
        },
      });
      if (
        modelName === 'globalFeatureFlags' &&
        'released' in parsedBody &&
        typeof parsedBody.released === 'boolean' &&
        'flag' in record
      ) {
        const matchingFlags = await db.featureFlag.findMany({
          args: {
            where: { flag: record.flag },
          },
        });

        const idsToUpdate = matchingFlags.map((f) => f.id);

        if (idsToUpdate.length > 0) {
          await db.featureFlag.updateMany({
            pk: idsToUpdate,
            data: { released: parsedBody.released },
            activityStreamData: {
              userId: req.auth.user.id,
              workspaceId: null,
              recordId: record.id,
            },
          });
        }
      }

      const { relations } = req.body;

      if (relations) {
        await Promise.all(
          relations.map(async (relation) => {
            const relationInfo = model.getDynamicManyRelations(
              relation.relationModel as keyof DbModelMap
            );
            if (relationInfo) {
              const relationJoinName = relationInfo.relationModel;
              const joinModel = db.getModel(relationJoinName);
              if (joinModel) {
                const { mainKey } = relationInfo.foreignKeys;
                const { relatedKey } = relationInfo.foreignKeys;

                await joinModel.updateRelations(
                  req.params.id,
                  relation.relatedIds,
                  mainKey,
                  relatedKey
                );
              }
            }
          })
        );

        if (model.algoliaModel?.getDataClass()) {
          await model.algoliaModel
            .getDataClass()
            .updateInAlgolia(req.params.id);
        }
      }

      // Save the embedding to the vector DB
      if (model.saveEmbedding) {
        await model.vectorDbService.embedRowsBatch(
          model.schemaTsName,
          [record as unknown as RowEmbeddingData],
          'workspaceId' in record ? record.workspaceId : null
        );
      }

      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            fields: issue.path as string[],
            message: issue.message,
          };
        });
        return res
          .status(400)
          .json({ error: 'Invalid data', validationErrors: errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: '' });
    }
  }
  return res.status(404).json({ error: 'Model not found' });
});

adminRouter.delete('/:model/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);
  if (model) {
    await model.delete({
      pk: req.params.id,
      activityStreamData: {
        userId: req.auth.user.id,
        workspaceId: null,
        recordId: req.params.id,
      },
    });
    return res.status(204).send();
  }
  return res.status(404).json({ error: 'Model not found' });
});

adminRouter.post('/updateGTMId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { gtmId } = req.body;
  await db.user.update({
    pk: req.auth.user.id,
    data: { gtmId },
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId: null,
      recordId: req.auth.user.id,
    },
  });
  return res.status(201).json({ status: true });
});

adminRouter.post('/:model', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);
  if (model) {
    const schema = insertModelSchemas[modelName];

    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    try {
      // Validate and parse the request body
      const parsedBody = schema.parse(req.body.data);

      if (
        'password' in parsedBody &&
        typeof parsedBody.password === 'string' &&
        parsedBody.password !== ''
      ) {
        parsedBody.password = await hashPassword(parsedBody.password);
      }

      const record = await model.createByAdmin({
        data: parsedBody,
        activityStreamData: {
          userId: req.auth.user.id,
          workspaceId: null,
        },
      });

      // Check id of created record to create
      if ('id' in record) {
        // Check many relations to create
        const { relations } = req.body;
        if (relations) {
          await Promise.all(
            relations.map(async (relation) => {
              const relationInfo = model.getDynamicManyRelations(
                relation.relationModel as keyof DbModelMap
              );
              if (relationInfo) {
                const relationJoinName = relationInfo.relationModel;
                const joinModel = db.getModel(relationJoinName);
                if (joinModel) {
                  const { mainKey } = relationInfo.foreignKeys;
                  const { relatedKey } = relationInfo.foreignKeys;
                  const insertData = relation.relatedIds.map((relatedId) => ({
                    [mainKey]: record.id,
                    [relatedKey]: relatedId,
                  }));
                  await joinModel.createManyByAdmin({
                    data: insertData,
                    activityStreamData: {
                      userId: req.auth?.user.id || '',
                      workspaceId: null,
                    },
                  });
                }
              }
            })
          );
          if (model.algoliaModel?.getDataClass()) {
            await model.algoliaModel.getDataClass().updateInAlgolia(record.id);
          }
        }

        // Save the embedding to the vector DB
        if (model.saveEmbedding) {
          await model.vectorDbService.embedRowsBatch(
            model.schemaTsName,
            [record as unknown as RowEmbeddingData],
            'workspaceId' in record ? record.workspaceId : null
          );
        }
      }

      if (
        modelName === 'users' &&
        'email' in record &&
        typeof record.email === 'string'
      ) {
        await sendEmailTemplate({
          template: {
            id: 'welcome',
            props: {},
          },
          options: {
            to: record.email,
            subject: 'Welcome to Fit ADS!',
          },
        });
      }

      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            fields: issue.path as string[],
            message: issue.message,
          };
        });
        return res
          .status(400)
          .json({ error: 'Invalid data', validationErrors: errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: '' });
    }
  }
  return res.status(404).json({ error: 'Model not found' });
});

adminRouter.get('/:model/relations/:relation', async (req, res) => {
  if (!req.auth) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const relationName = req.params.relation as keyof DbModelMap;

  // TODO: check if the relation exists in the model
  const model = db.getModel(relationName);
  if (model) {
    const choiceField = model.getAdminFieldChoiceName();
    const relationData = await model.findMany();
    const data: {
      id: string;
      label: string;
    }[] = [];
    relationData.forEach((item) => {
      if ('id' in item && choiceField in item) {
        data.push({
          id: item.id,
          label: (item as Record<string, string>)[choiceField] || '',
        });
      }
    });
    return res.status(200).json(data);
  }

  return res.status(404).json({ error: 'Relation not found' });
});
