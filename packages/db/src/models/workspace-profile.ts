import { eq } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbWorkspaceProfile } from '@/db/schema';
import { workspaceProfile as workspaceProfileTable } from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbWorkspacesProfileWhere = {
  workspaceId?: string;
};

export class DbWorkspaceProfileModel extends DbModel<
  typeof workspaceProfileTable,
  DbWorkspacesProfileWhere,
  'workspaceProfile'
> {
  public override get dbTablePkColumn(): PgColumn {
    return this.dbTable.workspaceId;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'workspaceProfile' {
    return 'workspaceProfile';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof workspaceProfileTable {
    return workspaceProfileTable;
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
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'workspaceProfile';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbWorkspacesProfileWhere
  ): Query {
    let filtered = query;

    if (where.workspaceId != null) {
      filtered = filtered.where(
        eq(this.dbTable.workspaceId, where.workspaceId)
      );
    }

    return filtered;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  public async findByWorkspaceId(
    workspaceId: string
  ): Promise<DbWorkspaceProfile | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.workspaceId, workspaceId))
      .execute();

    return data || null;
  }
}
