/* eslint-disable class-methods-use-this */
import type { SQL } from 'drizzle-orm';
import { and, eq, gte, ilike, lte, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbWebhooks } from '@/db/schema';
import { webhooks as webhooksTable } from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbWebhooksWhere = {
  workspaceId?: string;
  name?: string;
  url?: string;
};
export class DbWebhooksModel extends DbModel<
  typeof webhooksTable,
  DbWebhooksWhere,
  'webhooks'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'webhooks' {
    return 'webhooks';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof webhooksTable {
    return webhooksTable;
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
    return 'webhooks';
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
    where: DbWebhooksWhere
  ): Query {
    let filtered = query;

    if (where.name != null) {
      filtered = filtered.where(eq(this.dbTable.name, where.name));
    }

    if (where.url != null) {
      filtered = filtered.where(eq(this.dbTable.url, where.url));
    }

    return filtered;
  }

  public async findAllOrderedByCreatedAt(
    workspaceId: string
  ): Promise<DbWebhooks[]> {
    const data = await this.client
      .select()
      .from(webhooksTable)
      .where(
        and(
          sql`${webhooksTable.workspaceId} = ${workspaceId}`,
          sql`${webhooksTable.createdAt} IS NOT NULL`
        )
      )
      .orderBy(sql`${webhooksTable.createdAt}`)
      .execute();

    return data;
  }

  public async findById(webhookId: string): Promise<DbWebhooks | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.id, webhookId))
      .execute();

    return data || null;
  }

  public async findAllWebhooks(
    workspaceId: string,
    opts?: {
      filters?: {
        search?: string;
      };
      pagination?: { pageIndex?: number; pageSize?: number };
      sorting?: { column: string; direction: string }[];
    }
  ): Promise<DbWebhooks[]> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.search) {
      const search = `%${opts?.filters?.search}%`;
      conditions.push(ilike(this.dbTable.url, search));
    }

    const pageSize = opts?.pagination?.pageSize ?? 10;
    const pageIndex = opts?.pagination?.pageIndex ?? 0;

    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(and(eq(this.dbTable.workspaceId, workspaceId), ...conditions))
      .orderBy(this.dbTable.createdAt)
      .limit(pageSize)
      .offset(pageIndex * pageSize)
      .execute();

    return data;
  }

  public async findUrlsAndNamesByWorkspaceId(
    workspaceId: string
  ): Promise<
    { id: string; url: string; name: string; eventTypes: string[] }[]
  > {
    const rows = await this.client
      .select({
        id: this.dbTable.id,
        url: this.dbTable.url,
        name: this.dbTable.name,
        eventTypes: this.dbTable.eventTypes,
      })
      .from(this.dbTable)
      .where(eq(this.dbTable.workspaceId, workspaceId))
      .execute();

    return rows.map((row) => ({
      id: row.id,
      url: row.url,
      name: row.name,
      eventTypes: row.eventTypes,
    }));
  }

  public async findManyWithWhere(opts?: {
    args?: {
      where?: {
        from: string;
        to: string;
        workspaceId?: string;
      };
    };
  }): Promise<unknown[]> {
    const { args } = opts ?? {};
    const { workspaceId, from, to } = args?.where || {};

    let whereClause = workspaceId
      ? eq(this.dbTable.workspaceId, workspaceId)
      : undefined;

    if (from) {
      const condition = gte(this.dbTable.createdAt, from);
      whereClause = whereClause ? and(whereClause, condition) : condition;
    }

    if (to) {
      const condition = lte(this.dbTable.createdAt, to);
      whereClause = whereClause ? and(whereClause, condition) : condition;
    }

    const query = this.client
      .select({
        id: this.dbTable.id,
        createdAt: this.dbTable.createdAt,
        name: this.dbTable.name,
        url: this.dbTable.url,
        eventTypes: this.dbTable.eventTypes,
      })
      .from(this.dbTable)
      .where(whereClause);

    const results = await query.execute();

    return results;
  }
}
