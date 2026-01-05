import { ReportStatusEnum } from '@meltstudio/types';
import { put } from '@vercel/blob';
import { json2csv } from 'json-2-csv';
import { env } from 'process';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { reportsApiDef } from '@/api/routers/reports/def';

export const reportsRouter = ctx.router(reportsApiDef);

type UserData = {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  active: boolean;
};

type TablesHistoryData = {
  id: string;
  createdAt: string;
  user: string | null;
  action: string;
  tableName: string;
};

type WebhookData = {
  id: string;
  createdAt: string;
  name: string;
  url: string;
  eventTypes: string[];
};

type TableDataType = UserData | TablesHistoryData | WebhookData;

const getTableData = async (
  tableName: string,
  workspaceId: string,
  from: string,
  to: string
): Promise<TableDataType[]> => {
  switch (tableName) {
    case 'users':
      return db.user.findManyWithUserWorkspaces({
        args: {
          where: {
            from,
            to,
            workspaceId,
          },
        },
      }) as Promise<UserData[]>;
    case 'tables_history':
      return db.tablesHistory.findManyWithUserName({
        args: {
          where: {
            from,
            to,
            workspaceId,
          },
        },
      }) as Promise<TablesHistoryData[]>;
    case 'webhooks':
      return db.webhooks.findManyWithWhere({
        args: {
          where: {
            workspaceId,
            from,
            to,
          },
        },
      }) as Promise<WebhookData[]>;
    default:
      throw new Error(`Table ${tableName} not supported`);
  }
};

reportsRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { user } = req.auth;
  const { workspaceId, table, from, to, name } = req.body;

  const tableData = await getTableData(table, workspaceId, from, to);

  if (!Array.isArray(tableData) || tableData.length === 0) {
    return res.status(404).json({
      error: `No data found in table '${table}' for the specified date range`,
    });
  }

  const firstItem = tableData[0] as Record<string, unknown>;
  const headers = Object.keys(firstItem);

  const csvData = json2csv(tableData, { keys: headers });
  const csvFileName = `${table}-report-${new Date().getTime()}.csv`;

  if (!env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      error: 'Server misconfiguration: BLOB_READ_WRITE_TOKEN is missing',
    });
  }

  const response = await put(csvFileName, Buffer.from(csvData), {
    token: env.BLOB_READ_WRITE_TOKEN,
    access: 'public',
  });

  await db.reports.create({
    data: {
      name,
      from,
      to,
      workspaceId,
      downloadUrl: response.downloadUrl,
      reportStatus: ReportStatusEnum.DONE,
      exportedTable: table,
    },
    activityStreamData: {
      userId: user.id,
      workspaceId,
    },
  });

  return res.status(201).json({
    success: true,
  });
});
