import { ReportStatusEnum } from '@meltstudio/types';
import { put } from '@vercel/blob';
import { json2csv } from 'json-2-csv';
import { env } from 'process';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { reportsApiDef } from '@/api/routers/reports/def';
import type { DbVenue, DbVenueUserWithRelations } from '@/db/schema';

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

type TableDataType =
  | UserData
  | TablesHistoryData
  | WebhookData
  | DbVenue
  | DbVenueUserWithRelations;

const getTableData = async (
  tableName: string,
  workspaceId: string,
  from: string,
  to: string,
  venueOwnerId?: string
): Promise<TableDataType[]> => {
  switch (tableName) {
    // case 'users':
    //   return db.user.findManyWithUserWorkspaces({
    //     args: {
    //       where: {
    //         from,
    //         to,
    //         workspaceId,
    //       },
    //     },
    //   }) as Promise<UserData[]>;
    // case 'tables_history':
    //   return db.tablesHistory.findManyWithUserName({
    //     args: {
    //       where: {
    //         from,
    //         to,
    //         workspaceId,
    //       },
    //     },
    //   }) as Promise<TablesHistoryData[]>;
    // case 'webhooks':
    //   return db.webhooks.findManyWithWhere({
    //     args: {
    //       where: {
    //         workspaceId,
    //         from,
    //         to,
    //       },
    //     },
    //   }) as Promise<WebhookData[]>;
    case 'venue':
      return db.venue.findManyVenueByOwner({
        args: {
          where: {
            from,
            to,
            workspaceId,
            venueOwnerId,
          },
        },
      });
    case 'venue_users':
      if (!venueOwnerId) {
        throw new Error('venueOwnerId is required for venue_users report');
      }
      return db.venueUsers.getAllByOwnerId(venueOwnerId);
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

  // this report is only for venue owners
  const venueOwnerId = user.id;

  const tableData = await getTableData(
    table,
    workspaceId,
    from,
    to,
    venueOwnerId
  );

  if (!Array.isArray(tableData) || tableData.length === 0) {
    return res.status(404).json({
      error: `No data found in table '${table}' for the specified date range`,
    });
  }

  let processedData: object[] = tableData;

  if (table === 'venue_users') {
    processedData = (tableData as DbVenueUserWithRelations[]).map((item) => ({
      'Venue Name': item.venue.name,
      'User Name': item.user.name,
      'User Email': item.user.email,
      'Start Date': item.venue.start_event_time
        ? item.venue.start_event_time.toISOString()
        : '',
      'End Date': item.venue.end_event_time
        ? item.venue.end_event_time.toISOString()
        : '',
      Status: item.status,
      Comments: item.comments,
    }));
  }

  const firstItem = processedData[0] as Record<string, unknown>;
  const headers = Object.keys(firstItem);

  const csvData = json2csv(processedData, { keys: headers });
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
