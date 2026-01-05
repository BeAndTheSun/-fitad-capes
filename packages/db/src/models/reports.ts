import { eq } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbModelKeys } from '@/db/models/db';
import { reports as reportsTable } from '@/db/schema';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';

export type ReportsDbWhere = DbWhere & {
  workspaceId?: string;
};

export class DbReportsModel extends DbModel<
  typeof reportsTable,
  ReportsDbWhere,
  'reports'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'reports' {
    return 'reports';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof reportsTable {
    return reportsTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'workspaceId';
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'reports';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: ReportsDbWhere
  ): Query {
    let filtered = query;

    if (where.workspaceId != null) {
      filtered = filtered.where(
        eq(this.dbTable.workspaceId, where.workspaceId)
      );
    }

    return filtered;
  }
}
