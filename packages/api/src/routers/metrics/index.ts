import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { metricSchema } from '@/api/schemas/metrics';

import { metricsApiDef } from './def';

const QueryType = metricSchema.enum;

export const metricsRouter = ctx.router(metricsApiDef);

metricsRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { metric, workspaceId, sessionUserId } = req.body;
    let data: { label: string; count: number; id?: string }[];

    switch (metric) {
      case QueryType.USERS_OVER_TIME:
        data = (await db.user.getUsersOverTime(workspaceId)).map((r) => ({
          label: r.date,
          count: r.count,
        }));
        break;
      case QueryType.TOTAL_USERS: {
        const total = await db.user.getUserCount(workspaceId);
        data = [{ label: 'total', count: total }];
        break;
      }
      case QueryType.TOTAL_VENUES: {
        const total = await db.venue.getVenueCount();
        data = [{ label: 'total', count: total }];
        break;
      }
      case QueryType.USERS_PER_VENUE: {
        const rows = await db.user.getUsersPerVenue(workspaceId);
        data = rows.map((r) => ({
          label: `${r.userName} – ${r.venueName}`,
          count: 0,
          id: r.id,
        }));
        break;
      }
      case QueryType.VENUES_OVER_TIME:
        data = (await db.venue.getVenuesOverTime(workspaceId)).map((r) => ({
          label: r.date,
          count: r.count,
        }));
        break;
      case QueryType.USERS_LIST: {
        const users = await db.user.getUsersList(workspaceId);
        data = users.map((u) => ({ label: u.name, count: 0 }));
        break;
      }
      case QueryType.VENUES_LIST: {
        const venues = await db.venue.getVenuesList();
        data = venues.map((v) => ({ label: v.name, count: 0 }));
        break;
      }
      case QueryType.TOTAL_VENUES_BY_OWNER: {
        const count = await db.venue.getCountVenuesByOwner(sessionUserId ?? '');
        data = [{ label: 'total', count }];
        break;
      }
      case QueryType.SUPER_PARTICIPANTS_ON_VENUES_BY_OWNER: {
        data = (
          await db.venueUsers.getVenuesParticipantsCount({
            ownerId: sessionUserId ?? '',
          })
        ).map((r) => ({ label: r.date, count: r.count }));
        break;
      }
      case QueryType.TOP_3_VENUES_WITH_MOST_MEMBERS: {
        data = (
          await db.venueUsers.getVenuesParticipantsCount({
            ownerId: sessionUserId ?? '',
            limit: 3,
            orderByCountDesc: true,
          })
        ).map((r) => ({ label: r.date, count: r.count }));
        break;
      }
      case QueryType.PARTICIPANTS_BY_STATUS_BY_OWNER: {
        const rows = await db.venueUsers.getParticipantsStatusCounts({
          ownerId: sessionUserId ?? '',
        });
        data = rows.map((r) => ({
          label: r.status,
          count: r.count,
        }));
        break;
      }
      default:
        throw new Error('Unknown metric');
    }

    return res.status(200).json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching metrics:', error);
    return res
      .status(400)
      .json({ error: 'Error fetching data from PostgreSQL' });
  }
});
