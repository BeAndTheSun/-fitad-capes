import crypto from 'crypto';
import type { SQL } from 'drizzle-orm';
import {
  and,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbVenue, DbVenueExtended } from '@/db/schema';
import {
  users,
  userWorkspaces,
  userWorkspaces as userWorkspacesTable,
  venue as venueTable,
  venueUsers,
} from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';
import { generateDatesFrom28DaysAgo } from '@/db/utils/date-utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbVenueWhere = {
  name?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
};

export class DbVenueModel extends DbModel<
  typeof venueTable,
  DbVenueWhere,
  'venue'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'venue' {
    return 'venue';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof venueTable {
    return venueTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'name';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'venue';
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'venue'> {
    return {
      owner: true,
      users: {
        with: {
          user: true,
        },
      },
    };
  }

  protected get manyRelationsMap(): Map<string, ManyRelations> {
    return this.dynamicManyRelationsMap;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbVenueWhere
  ): Query {
    let filtered = query;
    if (where.name != null) {
      filtered = filtered.where(ilike(this.dbTable.name, where.name));
    }
    if (where.city != null) {
      filtered = filtered.where(ilike(this.dbTable.city, where.city));
    }
    if (where.country != null) {
      filtered = filtered.where(ilike(this.dbTable.country, where.country));
    }

    return filtered;
  }

  public async findAllVenues({
    filters,
    pagination,
  }: {
    filters?: { search?: string; isActive?: boolean };
    pagination: { pageIndex: number; pageSize: number };
  }): Promise<{ items: DbVenueExtended[]; total: number }> {
    const conditions: (SQL | undefined)[] = [];

    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(this.dbTable.name, search),
          ilike(this.dbTable.city, search),
          ilike(this.dbTable.country, search)
        )
      );
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(this.dbTable.isActive, filters.isActive));
    }

    const pageSize = pagination?.pageSize ?? 10;
    const pageIndex = pagination?.pageIndex ?? 0;

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.client.query.venue.findMany({
        where: whereCondition,
        with: {
          owner: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        limit: pageSize,
        offset: pageIndex * pageSize,
      }),
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(this.dbTable)
        .where(whereCondition)
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items: items as DbVenueExtended[], total };
  }

  public async findVenuesByUserId({
    userId,
    filters,
    pagination,
  }: {
    userId: string;
    filters?: { search?: string; isActive?: boolean };
    pagination: { pageIndex: number; pageSize: number };
  }): Promise<{ items: DbVenueExtended[]; total: number }> {
    // First, get all venue IDs for this user
    const userVenueIds = await this.client
      .select({ venueId: venueUsers.venueId })
      .from(venueUsers)
      .where(eq(venueUsers.userId, userId))
      .execute();

    const venueIds = userVenueIds.map((v) => v.venueId);

    // If user has no venues, return empty result
    if (venueIds.length === 0) {
      return { items: [], total: 0 };
    }

    const conditions: (SQL | undefined)[] = [
      inArray(this.dbTable.id, venueIds),
    ];

    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(this.dbTable.name, search),
          ilike(this.dbTable.city, search),
          ilike(this.dbTable.country, search)
        )
      );
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(this.dbTable.isActive, filters.isActive));
    }

    const pageSize = pagination?.pageSize ?? 10;
    const pageIndex = pagination?.pageIndex ?? 0;

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.client.query.venue.findMany({
        where: whereCondition,
        with: {
          owner: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        limit: pageSize,
        offset: pageIndex * pageSize,
      }),
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(this.dbTable)
        .where(whereCondition)
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items: items as DbVenueExtended[], total };
  }

  public async generateInvitationToken(venueId: string): Promise<string> {
    // Check if venue already has a token
    const existingVenue = await this.client.query.venue.findFirst({
      where: eq(this.dbTable.id, venueId),
      columns: {
        invitation_token: true,
      },
    });

    if (existingVenue?.invitation_token) {
      return existingVenue.invitation_token;
    }

    // Generate new token using crypto
    const token = crypto.randomUUID();

    // Update venue with new token
    await this.client
      .update(this.dbTable)
      .set({ invitation_token: token })
      .where(eq(this.dbTable.id, venueId))
      .execute();

    return token;
  }

  public async findByInvitationToken(
    token: string
  ): Promise<DbVenueExtended | null> {
    const venue = await this.client.query.venue.findFirst({
      where: eq(this.dbTable.invitation_token, token),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return (venue as DbVenueExtended) ?? null;
  }

  public async generateCheckingToken(venueId: string): Promise<string> {
    // Check if venue already has a checking token
    const existingVenue = await this.client.query.venue.findFirst({
      where: eq(this.dbTable.id, venueId),
      columns: {
        checking_token: true,
      },
    });

    if (existingVenue?.checking_token) {
      return existingVenue.checking_token;
    }

    // Generate new token using crypto
    const token = crypto.randomUUID();

    // Update venue with new checking token
    await this.client
      .update(this.dbTable)
      .set({ checking_token: token })
      .where(eq(this.dbTable.id, venueId))
      .execute();

    return token;
  }

  public async findByCheckingToken(
    token: string
  ): Promise<DbVenueExtended | null> {
    const venue = await this.client.query.venue.findFirst({
      where: eq(this.dbTable.checking_token, token),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return (venue as DbVenueExtended) ?? null;
  }

  public async getVenueCount(): Promise<number> {
    const result = await this.client
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(this.dbTable)
      .execute();

    return Number(result[0]?.count ?? 0);
  }

  public async getVenuesOverTime(
    workspaceId: string
  ): Promise<{ date: string; count: number }[]> {
    const result = await this.client
      .select({
        date: sql`DATE_TRUNC('day', ${this.dbTable.createdAt})`,
        count: sql`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(this.dbTable)
      .leftJoin(
        userWorkspacesTable,
        and(
          eq(this.dbTable.ownerId, userWorkspacesTable.userId),
          eq(userWorkspacesTable.workspaceId, workspaceId)
        )
      )
      .where(
        and(
          sql`${this.dbTable.createdAt} >= NOW() - INTERVAL '30 days'`,
          or(
            isNull(this.dbTable.ownerId),
            sql`${userWorkspacesTable.userId} IS NOT NULL`
          )
        )
      )
      .groupBy(sql`DATE_TRUNC('day', ${this.dbTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('day', ${this.dbTable.createdAt})`);

    const venueCounts = result as { date: string; count: number }[];

    const dates = generateDatesFrom28DaysAgo();

    const venueCountMap = venueCounts.reduce(
      (map, metric) => {
        const dateKey = metric.date.split(' ')[0];

        if (dateKey) {
          return { ...map, [dateKey]: metric.count };
        }

        return map;
      },
      {} as Record<string, number>
    );

    const completeData = dates.map((date) => ({
      date,
      count: venueCountMap[date] ?? 0,
    }));

    return completeData;
  }

  public async getVenuesList(): Promise<{ id: string; name: string }[]> {
    const result = await this.client
      .select({
        id: this.dbTable.id,
        name: this.dbTable.name,
      })
      .from(this.dbTable)
      .orderBy(this.dbTable.name)
      .execute();

    return result;
  }

  public async isOwner(userId: string): Promise<boolean> {
    const venue = await this.client.query.venue.findFirst({
      where: eq(this.dbTable.ownerId, userId),
      columns: { id: true },
    });
    return !!venue;
  }

  public async getCountVenuesByOwner(ownerId: string): Promise<number> {
    const result = await this.client
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(this.dbTable)
      .where(eq(this.dbTable.ownerId, ownerId))
      .execute();

    return Number(result[0]?.count ?? 0);
  }

  public async getVenuesByOwner(ownerId: string): Promise<DbVenue[]> {
    return this.client.query.venue.findMany({
      where: eq(this.dbTable.ownerId, ownerId),
    });
  }

  public async getVenueById(id: string): Promise<DbVenue | undefined> {
    return this.client.query.venue.findFirst({
      where: eq(this.dbTable.id, id),
    });
  }

  public async updateVenueById(
    id: string,
    data: Partial<DbVenue>
  ): Promise<DbVenue | undefined> {
    const result = await this.client
      .update(this.dbTable)
      .set(data)
      .where(eq(this.dbTable.id, id))
      .returning()
      .execute();
    return result[0];
  }

  public async findManyVenueByOwner(opts?: {
    args?: {
      where?: {
        from?: string;
        to?: string;
        workspaceId?: string;
        venueOwnerId?: string;
      };
    };
  }): Promise<DbVenue[]> {
    const { args } = opts ?? {};
    const { workspaceId, from, to, venueOwnerId } = args?.where || {};

    const whereConditions = [];

    if (!venueOwnerId) {
      throw new Error('venueOwnerId is required');
    }

    if (workspaceId) {
      whereConditions.push(eq(userWorkspaces.workspaceId, workspaceId));
    }

    if (from) {
      whereConditions.push(gte(users.createdAt, from));
    }

    if (to) {
      whereConditions.push(lte(users.createdAt, to));
    }

    const results = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.ownerId, venueOwnerId));

    return results as unknown as DbVenue[];
  }
}
