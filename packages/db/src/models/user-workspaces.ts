/* eslint-disable class-methods-use-this */
import type { SQL } from 'drizzle-orm';
import { and, eq, ilike, inArray, sql } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbUser, DbUserWorkspaces } from '@/db/schema';
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

  public async findFirstTrainerByWorkspaceId(
    workspaceId: string
  ): Promise<DbUser | null> {
    const result = await this.client.query.userWorkspaces.findFirst({
      where: and(
        eq(this.dbTable.workspaceId, workspaceId),
        eq(this.dbTable.role, 'admin')
      ),
      with: {
        user: true,
      },
    });

    return result?.user || null;
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

  public async findAllUserWorkspaces({
    filters,
    pagination,
  }: {
    filters?: { search?: string };
    pagination: { pageIndex: number; pageSize: number };
  }): Promise<{ items: DbUserWorkspaces[]; total: number }> {
    const pageSize = pagination?.pageSize ?? 10;
    const pageIndex = pagination?.pageIndex ?? 0;

    const conditions: (SQL | undefined)[] = [];

    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(ilike(this.dbTable.role, search));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.client
        .select()
        .from(this.dbTable)
        .where(whereCondition)
        .limit(pageSize)
        .offset(pageIndex * pageSize)
        .execute(),
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(this.dbTable)
        .where(whereCondition)
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items: items as DbUserWorkspaces[], total };
  }

  public override async delete({ pk }: { pk: string }): Promise<void> {
    const parts = pk.split(':');
    if (parts.length !== 2) {
      // Fallback or error for safety
      // For now, let's call super if it matches simple ID, but we know it's dangerous.
      // Given the constraints, let's assume we ONLY support composite delete for this model via admin
      throw new Error(
        'Invalid primary key for userWorkspaces. Expected format "userId:workspaceId"'
      );
    }

    const [userId, workspaceId] = parts;
    if (!userId || !workspaceId) {
      throw new Error('Invalid composite key: missing userId or workspaceId');
    }

    await this.client.transaction(async (tx) => {
      await tx
        .delete(userWorkspacesTable)
        .where(
          and(
            eq(userWorkspacesTable.userId, userId),
            eq(userWorkspacesTable.workspaceId, workspaceId)
          )
        );
    });
  }
}
