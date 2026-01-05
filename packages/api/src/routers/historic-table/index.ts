import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { historicTableApiDef } from './def';

export const historicTableRouter = ctx.router(historicTableApiDef);

historicTableRouter.get('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const historicTable = await db.tablesHistory.findWithUser();

  return res.status(200).json({ historic: historicTable });
});

historicTableRouter.get('/record/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  const historicRecord = await db.tablesHistory.findById(id ?? '');

  if (!historicRecord) {
    return res.status(404).json({ error: 'Historic record not found' });
  }

  const actionData: unknown =
    typeof historicRecord.actionDescription === 'string'
      ? JSON.parse(historicRecord.actionDescription)
      : historicRecord.actionDescription;

  const response = {
    id: historicRecord.id,
    action: historicRecord.action,
    tableName: historicRecord.tableName,
    recordId: historicRecord.recordId,
    actionData,
    timestamp: historicRecord.createdAt,
  };

  return res.status(200).json(response);
});

historicTableRouter.get('/workspace/:workspaceId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const { workspaceId } = req.params;
  const historicTable = await db.tablesHistory.findWithUser({
    workspaceId,
  });

  return res.status(200).json({ historic: historicTable });
});
