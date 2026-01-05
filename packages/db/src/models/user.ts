/* eslint-disable class-methods-use-this */
import type { MemberFiltersType } from '@meltstudio/types';
import type { SQL } from 'drizzle-orm';
import { and, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type {
  DbUserExtended,
  DbUserWithPasswordExtended,
  DbUserWithRole,
} from '@/db/schema';
import {
  users,
  users as usersTable,
  userWorkspaces,
  userWorkspaces as userWorskpacesTable,
  workspace as workspaceTable,
} from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';
import { generateDatesFrom28DaysAgo } from '@/db/utils/date-utils';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type UserDbWhere = DbWhere & MemberFiltersType;

export type Metrics = {
  date: string;
  count: number;
};

export class DbUserModel extends DbModel<
  typeof usersTable,
  UserDbWhere,
  'users'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'users' {
    return 'users';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof usersTable {
    return usersTable;
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
  protected get modelName(): DbModelKeys {
    return 'users';
  }

  public override get saveEmbedding(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'users'> {
    return {
      featureFlags: true,
      workspaces: {
        with: {
          workspace: true,
        },
      },
      inviteToken: true,
      passwordRecoveryTokens: true,
    };
  }

  protected get manyRelationsMap(): Map<string, ManyRelations> {
    this.registerManyRelations('workspace', 'userWorkspaces', {
      mainKey: 'userId',
      relatedKey: 'workspaceId',
      relatedField: 'workspaces',
    });

    return this.dynamicManyRelationsMap;
  }

  // // eslint-disable-next-line class-methods-use-this
  // protected override registerDefaultJoinTables(): void {
  //   this.registerJoinTableInfo('users', 'workspace', 'user-workspaces', {
  //     mainKey: 'userId',
  //     relatedKey: 'workspaceId',
  //   });
  // }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: UserDbWhere
  ): Query {
    const conditions: (SQL | undefined)[] = [];
    if (where.search != null) {
      const search = `%${where.search}%`;
      conditions.push(
        or(ilike(usersTable.name, search), ilike(usersTable.email, search))
      );
    }

    if (where.id) {
      conditions.push(eq(usersTable.id, where.id.trim()));
    }

    if (where.name) {
      const name = `%${where.name.trim()}%`;
      conditions.push(ilike(usersTable.name, name));
    }

    if (where.email) {
      const email = `%${where.email.trim()}%`;
      conditions.push(ilike(usersTable.email, email));
    }

    if (where.active) {
      const active = where.active === 'true';
      conditions.push(eq(usersTable.active, active));
    }

    return query.where(and(...conditions));
  }

  public async findUniqueByID(id: string): Promise<DbUserExtended | null> {
    const user = await this.client.query.users.findFirst({
      columns: { password: false },
      where: eq(usersTable.id, id),
      with: {
        featureFlags: true,
        workspaces: {
          with: {
            workspace: true,
          },
        },
      },
    });
    if (user == null) {
      return null;
    }

    return user;
  }

  public async findUniqueByEmail(
    email: string
  ): Promise<DbUserExtended | null> {
    const user = await this.client.query.users.findFirst({
      columns: { password: false },
      where: eq(usersTable.email, email),
      with: {
        featureFlags: true,
        workspaces: {
          with: {
            workspace: true,
          },
        },
      },
    });
    if (user == null) {
      return null;
    }

    return user;
  }

  public async findManyByEmail(emails: string[]): Promise<DbUserExtended[]> {
    const userList = await this.client.query.users.findMany({
      columns: { password: false },
      where: inArray(usersTable.email, emails),
      with: {
        featureFlags: true,
        workspaces: {
          with: {
            workspace: true,
          },
        },
      },
    });

    return userList;
  }

  public async findUniqueByEmailWithPassword(
    email: string
  ): Promise<DbUserWithPasswordExtended | null> {
    const user = await this.client.query.users.findFirst({
      where: eq(usersTable.email, email),
      with: {
        featureFlags: true,
        workspaces: {
          with: {
            workspace: true,
          },
        },
      },
    });
    if (user == null) {
      return null;
    }

    return user;
  }

  public async getUsersOverTime(workspaceId: string): Promise<Metrics[]> {
    const result = await this.client
      .select({
        date: sql`DATE_TRUNC('day', ${usersTable.createdAt})`,
        count: sql`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(usersTable)
      .where(
        sql`${usersTable.createdAt} >= NOW() - INTERVAL '30 days' AND
            EXISTS (
              SELECT 1
              FROM ${userWorskpacesTable}
              WHERE ${userWorskpacesTable.workspaceId} = ${workspaceId}
              AND ${userWorskpacesTable.userId} = ${usersTable.id}
            )`
      )
      .groupBy(sql`DATE_TRUNC('day', ${usersTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('day', ${usersTable.createdAt})`);

    const userCounts = result as Metrics[];

    const dates = generateDatesFrom28DaysAgo();

    const userCountMap = userCounts.reduce(
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
      count: userCountMap[date] ?? 0,
    }));

    return completeData;
  }

  public async getWorkspaceMembers(
    workspaceId: string
  ): Promise<DbUserWithRole[]> {
    const usersData = await this.client
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        active: usersTable.active,
        createdAt: usersTable.createdAt,
        is2faEnabled: usersTable.is2faEnabled,
        profileImage: usersTable.profileImage,
        isSuperAdmin: usersTable.isSuperAdmin,
        gtmId: usersTable.gtmId,
        workspaces: sql`
        json_agg(
          json_build_object(
            'userId', ${userWorskpacesTable.userId},
            'workspaceId', ${userWorskpacesTable.workspaceId},
            'role', ${userWorskpacesTable.role},
            'selected', ${workspaceTable.id} = ${workspaceId}
          )
        ) FILTER (WHERE ${userWorskpacesTable.workspaceId} IS NOT NULL)
      `.as('workspaces'),
      })
      .from(usersTable)
      .leftJoin(
        userWorskpacesTable,
        eq(usersTable.id, userWorskpacesTable.userId)
      )
      .leftJoin(
        workspaceTable,
        eq(userWorskpacesTable.workspaceId, workspaceTable.id)
      )
      .where(eq(userWorskpacesTable.workspaceId, workspaceId))
      .groupBy(
        usersTable.id,
        usersTable.name,
        usersTable.email,
        usersTable.active,
        usersTable.createdAt,
        usersTable.is2faEnabled,
        usersTable.profileImage,
        usersTable.isSuperAdmin,
        usersTable.gtmId
      );

    return usersData as unknown as DbUserWithRole[];
  }

  public async findManyWithUserWorkspaces(opts?: {
    args?: {
      where?: {
        from?: string;
        to?: string;
        workspaceId?: string;
      };
    };
  }): Promise<DbUserWithRole[]> {
    const { args } = opts ?? {};
    const { workspaceId, from, to } = args?.where || {};

    const whereConditions = [];

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
      .select({
        id: users.id,
        createdAt: users.createdAt,
        email: users.email,
        name: users.name,
        active: users.active,
      })
      .from(users)
      .innerJoin(userWorkspaces, eq(users.id, userWorkspaces.userId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .execute();

    return results as unknown as DbUserWithRole[];
  }
}
