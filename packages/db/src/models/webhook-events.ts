/* eslint-disable class-methods-use-this */
import type { SQL } from 'drizzle-orm';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbWebhookEvents } from '@/db/schema';
import { webhookEvents as webhookEventsTable } from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbWebhookEventsWhere = {
  targetUrl?: string;
  status?: string;
};
export class DbWebhookEventsModel extends DbModel<
  typeof webhookEventsTable,
  DbWebhookEventsWhere,
  'webhookEvents'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'webhookEvents' {
    return 'webhookEvents';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof webhookEventsTable {
    return webhookEventsTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'workspaceId';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'webhookEvents';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return false;
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbWebhookEventsWhere
  ): Query {
    let filtered = query;

    if (where.targetUrl != null) {
      filtered = filtered.where(eq(this.dbTable.targetUrl, where.targetUrl));
    }

    if (where.status != null) {
      filtered = filtered.where(eq(this.dbTable.status, where.status));
    }

    return filtered;
  }

  public async findAllOrderedByCreatedAt(
    webhookId: string,
    opts?: {
      filters?: {
        search?: string;
      };
      pagination?: { pageIndex?: number; pageSize?: number };
      sorting?: { column: string; direction: string }[];
    }
  ): Promise<DbWebhookEvents[]> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.search) {
      const search = `%${opts?.filters?.search}%`;
      conditions.push(ilike(this.dbTable.name, search));
    }

    const pageSize = opts?.pagination?.pageSize ?? 5;
    const pageIndex = opts?.pagination?.pageIndex ?? 0;

    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(
        and(
          sql`${this.dbTable.webhookId} = ${webhookId}`,
          sql`${this.dbTable.createdAt} IS NOT NULL`,
          ...conditions
        )
      )
      .orderBy(desc(this.dbTable.createdAt))
      .limit(pageSize)
      .offset(pageIndex * pageSize)
      .execute();

    return data;
  }
}
