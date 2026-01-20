import type { SQL } from 'drizzle-orm';
import { and, ilike, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbUser, DbUserWorkspaces, DbWorkspace } from '@/db/schema';
import { workspace as workspacesTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbWorkspaceWhere = {
  name?: string;
};

export class DbWorkspaceModel extends DbModel<
  typeof workspacesTable,
  DbWorkspaceWhere,
  'workspace'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'workspace' {
    return 'workspace';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof workspacesTable {
    return workspacesTable;
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
    return 'workspace';
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'workspace'> {
    return {
      users: {
        with: {
          user: true,
        },
      },
    };
  }

  protected get manyRelationsMap(): Map<string, ManyRelations> {
    this.registerManyRelations('users', 'userWorkspaces', {
      mainKey: 'workspaceId',
      relatedKey: 'userId',
      relatedField: 'users',
    });

    return this.dynamicManyRelationsMap;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbWorkspaceWhere
  ): Query {
    let filtered = query;
    if (where.name != null) {
      filtered = filtered.where(ilike(this.dbTable.name, where.name));
    }

    return filtered;
  }

  public async findAllWorkspaces({
    filters,
    pagination,
  }: {
    filters?: { search?: string };
    pagination: { pageIndex: number; pageSize: number };
  }): Promise<{ items: DbWorkspace[]; total: number }> {
    const conditions: SQL[] = [];

    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(ilike(this.dbTable.name, search));
    }

    const pageSize = pagination?.pageSize ?? 10;
    const pageIndex = pagination?.pageIndex ?? 0;

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    let query = this.client
      .select()
      .from(this.dbTable)
      .where(whereCondition)
      .$dynamic();

    if (pageSize > 0) {
      query = query.limit(pageSize).offset(pageIndex * pageSize);
    }

    const [items, totalResult] = await Promise.all([
      query.execute(),
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(this.dbTable)
        .where(whereCondition)
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items: items as DbWorkspace[], total };
  }

  public override async findUniqueByPkAdmin(
    pk: string,
    loadRelations = false
  ): Promise<
    | (DbWorkspace & {
        users?: (DbUserWorkspaces & { user: DbUser | null; id: string })[];
      })
    | null
  > {
    const row = await super.findUniqueByPkAdmin(pk, false);

    if (!row) {
      return null;
    }

    if (!loadRelations) {
      return row;
    }

    // Load other relations using default generic method if needed, but for 'users' we need custom loading
    // For now, let's just load users manually as we know we need the role

    const userWorkspacesData = await this.client.query.userWorkspaces.findMany({
      where: (userWorkspaces, { eq }) => eq(userWorkspaces.workspaceId, pk),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const users = userWorkspacesData.map((uw) => ({
      ...uw,
      id: `${uw.userId}:${uw.workspaceId}`,
      // Ensure we have easier access to user details at the top level if needed,
      // but the frontend seems to expect { role, user: { ... } } which this structure provides.
      // uw has { userId, workspaceId, role, user: { ... } }
    }));

    Object.assign(row, { users });

    return row;
  }
}
