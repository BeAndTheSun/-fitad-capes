/* eslint-disable class-methods-use-this */
import { IntegrationType } from '@meltstudio/types';
import type { SQL } from 'drizzle-orm';
import { and, eq, ilike } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbIntegrationKey } from '@/db/schema';
import {
  integration as integrationTable,
  integrationKey as integrationKeyTable,
} from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbIntegrationKeyWhere = {
  integrationId?: string;
};

export class DbIntegrationKeyModel extends DbModel<
  typeof integrationKeyTable,
  DbIntegrationKeyWhere,
  'integrationKey'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'integrationKey' {
    return 'integrationKey';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof integrationKeyTable {
    return integrationKeyTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'name';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'integrationKey';
  }

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
    where: DbIntegrationKeyWhere
  ): Query {
    let filtered = query;

    if (where.integrationId != null) {
      filtered = filtered.where(
        eq(this.dbTable.integrationId, where.integrationId)
      );
    }

    return filtered;
  }

  public async findByIntegrationId(
    integrationID: string
  ): Promise<DbIntegrationKey | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.integrationId, integrationID))
      .execute();

    return data || null;
  }

  public async findAllWebhookUrlsOrderedByCreatedAt(
    workspaceId: string,
    opts?: {
      filters?: {
        search?: string;
      };
      pagination?: { pageIndex?: number; pageSize?: number };
      sorting?: { column: string; direction: string }[];
    }
  ): Promise<{ id: string; value: string }[]> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.search) {
      const search = `%${opts?.filters?.search}%`;
      conditions.push(ilike(this.dbTable.value, search));
    }

    const pageSize = opts?.pagination?.pageSize ?? 10;
    const pageIndex = opts?.pagination?.pageIndex ?? 0;

    const data = await this.client
      .select({
        id: this.dbTable.id,
        value: this.dbTable.value,
      })
      .from(this.dbTable)
      .innerJoin(
        integrationTable,
        eq(this.dbTable.integrationId, integrationTable.id)
      )
      .where(
        and(
          eq(integrationTable.workspaceId, workspaceId),
          eq(this.dbTable.keyName, IntegrationType.WEBHOOK_URL),
          ...conditions
        )
      )
      .orderBy(this.dbTable.createdAt)
      .limit(pageSize)
      .offset(pageIndex * pageSize)
      .execute();
    return data;
  }
}
