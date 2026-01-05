import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { webhooksApiDef } from './def';

export const webhooksRouter = ctx.router(webhooksApiDef);

webhooksRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const webhook = await db.webhooks.create({
    data: req.body,
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId: req.body.workspaceId,
    },
  });

  return res.status(201).json(webhook);
});

webhooksRouter.delete('/delete', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { id } = req.body;

  const existingWebhook = await db.webhooks.findById(id);

  await db.webhooks.delete({
    pk: id,
    activityStreamData: {
      userId: req.auth.user.id,
      workspaceId: existingWebhook?.workspaceId ?? '',
      recordId: id,
    },
  });

  return res.status(200).json({ success: true });
});

webhooksRouter.get('/:workspaceId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.params;
  const { query: queryFilters } = req.query;

  const filters = queryFilters?.filters || {};
  const pagination = queryFilters?.pagination || {};
  const sorting = queryFilters?.sorting || [];

  try {
    const options = {
      filters: {
        id: filters?.id,
        value: filters?.url,
        search: filters?.search,
      },
      pagination: {
        pageIndex: Number(pagination?.pageIndex) || 0,
        pageSize: Number(pagination?.pageSize) || 10,
      },
      sorting: sorting.map((sort: { column: string; order: string }) => ({
        column: sort.column,
        direction:
          sort.order === 'asc' || sort.order === 'desc' ? sort.order : 'asc',
      })),
    };

    const webhookUrls = await db.webhooks.findAllWebhooks(
      workspaceId as string,
      options
    );

    const total = webhookUrls.length;
    const limit = options.pagination.pageSize;
    const offset = options.pagination.pageIndex * limit;
    const pageCount = Math.ceil(total / limit);

    const formattedResponse = {
      items: webhookUrls.map((v) => ({
        id: v.id,
        url: v.url,
        name: v.name,
      })),
      total,
      limit,
      offset,
      pageCount,
    };

    return res.status(200).json(formattedResponse);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch webhook URLs' });
  }
});

webhooksRouter.get('/events/:webhookId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { webhookId } = req.params;
  const { query: queryFilters } = req.query;

  const filters = queryFilters?.filters || {};
  const pagination = queryFilters?.pagination || {};
  const sorting = queryFilters?.sorting || [];

  try {
    const options = {
      filters: {
        status: filters?.status,
        eventType: filters?.eventType,
        eventTableName: filters?.eventTableName,
        search: filters?.search,
      },
      pagination: {
        pageIndex: Number(pagination?.pageIndex) || 0,
        pageSize: Number(pagination?.pageSize) || 10,
      },
      sorting: sorting.map((sort: { column: string; order: string }) => ({
        column: sort.column,
        direction:
          sort.order === 'asc' || sort.order === 'desc' ? sort.order : 'asc',
      })),
    };

    const events = await db.webhookEvents.findAllOrderedByCreatedAt(
      webhookId as string,
      options
    );
    const formattedEvents = events.map((event) => ({
      ...event,
      response: event.response as JSON,
      payload: event.payload as JSON,
    }));

    const total = formattedEvents.length;
    const limit = options.pagination.pageSize;
    const offset = options.pagination.pageIndex * limit;
    const pageCount = Math.ceil(total / limit);

    return res.status(200).json({
      items: formattedEvents,
      total,
      limit,
      offset,
      pageCount,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch webhook events' });
  }
});
