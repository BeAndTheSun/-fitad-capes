/* eslint-disable class-methods-use-this */
import { and, eq, inArray } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbUserWorkspaces } from '@/db/schema';
import { userWorkspaces as userWorkspacesTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbUserWorkspacesWhere = {
  userId?: string;
};

export class DbUserWorkspacesModel extends DbModel<
  typeof userWorkspacesTable,
  DbUserWorkspacesWhere,
  'userWorkspaces'
> {
  public override get dbTablePkColumn(): PgColumn {
    return this.dbTable.userId;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'userWorkspaces' {
    return 'userWorkspaces';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof userWorkspacesTable {
    return userWorkspacesTable;
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
    return 'userWorkspaces';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'userWorkspaces'> {
    return { user: true, workspace: true };
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

  // // eslint-disable-next-line class-methods-use-this
  // protected override registerDefaultJoinTables(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbUserWorkspacesWhere
  ): Query {
    let filtered = query;
    if (where.userId != null) {
      filtered = filtered.where(eq(this.dbTable.userId, where.userId));
    }

    return filtered;
  }

  public async findByUserIdAndWorkspaceId(
    userId: string,
    workspaceId: string
  ): Promise<DbUserWorkspaces | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(
        and(
          eq(this.dbTable.userId, userId),
          eq(this.dbTable.workspaceId, workspaceId)
        )
      )
      .execute();

    return data || null;
  }

  public async findManyByUserIdAndWorkspaceId(
    userIdList: string[],
    workspaceId: string
  ): Promise<DbUserWorkspaces[]> {
    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(
        and(
          eq(this.dbTable.workspaceId, workspaceId),
          inArray(this.dbTable.userId, userIdList)
        )
      )
      .execute();

    return data;
  }

  public async updateRoleMultipleUsersInWorkspace(
    users: string[],
    workspaceId: string,
    role: string
  ): Promise<void> {
    await this.client
      .update(userWorkspacesTable)
      .set({ role })
      .where(
        and(
          inArray(userWorkspacesTable.userId, users),
          eq(userWorkspacesTable.workspaceId, workspaceId)
        )
      );
  }
}
