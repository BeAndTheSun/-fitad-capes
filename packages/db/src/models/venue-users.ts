/* eslint-disable class-methods-use-this */
import { and, desc, eq, sql } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbVenueUserWithRelations } from '@/db/schema';
import {
  venue as venueTable,
  venueUsers as venueUsersTable,
} from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DBVenueUserWhere = {
  venueId: string;
  userId: string;
};

export class DBVenueUserModel extends DbModel<
  typeof venueUsersTable,
  DBVenueUserWhere,
  'venueUsers'
> {
  public override get dbTablePkColumn(): PgColumn {
    return this.dbTable.id;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'venueUsers' {
    return 'venueUsers';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof venueUsersTable {
    return venueUsersTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'userId';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'venueUsers';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'venueUsers'> {
    return { user: true, venue: true };
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DBVenueUserWhere
  ): Query {
    let filtered = query;
    if (where.userId != null) {
      filtered = filtered.where(eq(this.dbTable.userId, where.userId));
    }

    if (where.venueId != null) {
      filtered = filtered.where(eq(this.dbTable.venueId, where.venueId));
    }

    return filtered;
  }

  public async getAllByVenueId(
    venueId: string
  ): Promise<DbVenueUserWithRelations[]> {
    return this.client.query.venueUsers.findMany({
      where: (venueUsers) => eq(venueUsers.venueId, venueId),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
        venue: {
          columns: {
            id: true,
          },
        },
      },
    });
  }

  public async deleteById(id: string): Promise<void> {
    await this.client.delete(this.dbTable).where(eq(this.dbTable.id, id));
  }

  public async isUserInVenue(
    userId: string,
    venueId: string
  ): Promise<boolean> {
    const result = await this.client.query.venueUsers.findFirst({
      where: (venueUsers) =>
        and(eq(venueUsers.userId, userId), eq(venueUsers.venueId, venueId)),
    });

    return result != null;
  }

  public async findByUserAndVenue(
    userId: string,
    venueId: string
  ): Promise<DbVenueUserWithRelations | null> {
    const result = await this.client.query.venueUsers.findFirst({
      where: (venueUsers) =>
        and(eq(venueUsers.userId, userId), eq(venueUsers.venueId, venueId)),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
        venue: {
          columns: {
            id: true,
          },
        },
      },
    });

    return (result as DbVenueUserWithRelations) ?? null;
  }

  public async updateStatus(
    userId: string,
    venueId: string,
    status: 'joined' | 'checking' | 'completed' | 'failed'
  ): Promise<void> {
    await this.client
      .update(this.dbTable)
      .set({ status })
      .where(
        and(eq(this.dbTable.userId, userId), eq(this.dbTable.venueId, venueId))
      )
      .execute();
  }

  public async getParticipantsStatusCounts({
    ownerId,
  }: {
    ownerId: string;
  }): Promise<{ status: string; count: number }[]> {
    const result = await this.client
      .select({
        status: this.dbTable.status,
        count: sql<number>`CAST(COUNT(${this.dbTable.userId}) AS INTEGER)`,
      })
      .from(this.dbTable)
      .leftJoin(venueTable, eq(this.dbTable.venueId, venueTable.id))
      .where(eq(venueTable.ownerId, ownerId))
      .groupBy(this.dbTable.status)
      .execute();

    return result.map((r) => ({
      status: r.status,
      count: Number(r.count),
    }));
  }

  public async getVenuesParticipantsCount({
    ownerId,
    limit,
    orderByCountDesc = false,
  }: {
    ownerId: string;
    limit?: number;
    orderByCountDesc?: boolean;
  }): Promise<{ date: string; count: number }[]> {
    const baseQuery = this.client
      .select({
        name: venueTable.name,
        count: sql<number>`CAST(COUNT(${this.dbTable.userId}) AS INTEGER)`,
      })
      .from(venueTable)
      .leftJoin(this.dbTable, eq(venueTable.id, this.dbTable.venueId))
      .where(eq(venueTable.ownerId, ownerId))
      .groupBy(venueTable.id, venueTable.name);

    const query = orderByCountDesc
      ? baseQuery.orderBy(desc(sql`count`))
      : baseQuery;

    const result = limit
      ? await query.limit(limit).execute()
      : await query.execute();

    return result.map((r) => ({
      date: r.name,
      count: Number(r.count),
    }));
  }
}
