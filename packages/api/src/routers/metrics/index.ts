import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { metricsApiDef } from './def';

enum QueryType {
  USERS_OVER_TIME = 'USERS_OVER_TIME',
}

export const metricsRouter = ctx.router(metricsApiDef);

metricsRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const { metric, workspaceId } = req.body;

    let data;

    switch (metric as QueryType) {
      case QueryType.USERS_OVER_TIME:
        data = await db.user.getUsersOverTime(workspaceId);
        break;
      default:
        throw new Error('Unknown metric');
    }

    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Error fetching data from PostgreSQL' });
  }
});
