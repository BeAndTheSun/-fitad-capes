import { TaskRunnerClient } from '@meltstudio/tasks';
import { TaskType } from '@meltstudio/types';

import { config } from '@/api/config';
import { ctx } from '@/api/context';
import { db } from '@/api/db';
import type { DbModelKeys } from '@/db/models/db';

import { taskRunnerApiDef } from './def';

export const taskRunnerRouter = ctx.router(taskRunnerApiDef);

taskRunnerRouter.post('/export-db', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { id } = await TaskRunnerClient.getInstance().createTask(
    TaskType.EXPORT_DB_TO_CSV,
    req.body,
    config.storage.ddbTableName
  );

  return res.status(200).send({ success: true, id });
});

taskRunnerRouter.get('/tasks', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const tasks = await TaskRunnerClient.getInstance().getAllTasks(
    config.storage.ddbTableName
  );

  return res.status(200).send(tasks);
});
taskRunnerRouter.get('/:modelName/tasksByModel', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const tasks = await TaskRunnerClient.getInstance().getTasksByModelName(
    config.storage.ddbTableName,
    req.params.modelName
  );

  return res.status(200).send(tasks);
});

taskRunnerRouter.get('/tasks/:taskId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const task = await TaskRunnerClient.getInstance().getTask(
    req.params.taskId,
    config.storage.ddbTableName
  );

  return res.status(200).send(task);
});

taskRunnerRouter.post('/:modelName/export-model', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.modelName as DbModelKeys;

  if (!(modelName in db.models)) {
    return res.status(404).json({ error: 'Model not found' });
  }

  const { id } = await TaskRunnerClient.getInstance().createTask(
    TaskType.EXPORT_MODEL_TO_CSV,
    req.body,
    config.storage.ddbTableName,
    modelName
  );

  return res.status(200).send({ success: true, id });
});
