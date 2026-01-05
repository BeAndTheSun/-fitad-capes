/* eslint-disable class-methods-use-this */
import type { ActivityStreamData } from '@meltstudio/types';
import { ActivityActions } from '@meltstudio/types';
import type { SQL } from 'drizzle-orm';
import { and, eq, ilike, or } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbUserFeatureFlags } from '@/db/schema';
import { userFeatureFlags as userFeatureFlagsTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbUserFeatureFlagsWithUserName = DbUserFeatureFlags & {
  user: { name: string; id: string };
};

export class DBUserFeatureFlags extends DbModel<
  typeof userFeatureFlagsTable,
  DbWhere,
  'userFeatureFlags'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'userFeatureFlags' {
    return 'userFeatureFlags';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof userFeatureFlagsTable {
    return userFeatureFlagsTable;
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
    return 'userFeatureFlag';
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'userFeatureFlags'> {
    return { featureFlag: true, user: true };
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbWhere
  ): Query {
    const conditions: (SQL | undefined)[] = [];
    if (where.search != null) {
      const search = `%${where.search}%`;
      conditions.push(or(ilike(userFeatureFlagsTable.userId, search)));
    }

    return query.where(and(...conditions));
  }

  public async findManyByUserId(userId: string): Promise<DbUserFeatureFlags[]> {
    return this.client.query.userFeatureFlags.findMany({
      where: eq(userFeatureFlagsTable.userId, userId),
    });
  }

  public async findManyByFeatureFlagId(
    featureFlagId: string
  ): Promise<DbUserFeatureFlagsWithUserName[]> {
    return this.client.query.userFeatureFlags.findMany({
      where: eq(userFeatureFlagsTable.featureFlagId, featureFlagId),
      with: {
        user: {
          columns: { name: true, id: true },
        },
      },
    });
  }

  public async findByUserIdAndFeatureFlagId(
    userId: string,
    featureFlagId: string
  ): Promise<DbUserFeatureFlags[]> {
    return this.client.query.userFeatureFlags.findMany({
      where: (userFeatureFlags, { eq: equals }) =>
        equals(userFeatureFlags.userId, userId) &&
        equals(userFeatureFlags.featureFlagId, featureFlagId),
    });
  }

  public async deleteByUser(
    userId: string,
    featureFlagId: string,
    activityStreamData: ActivityStreamData
  ): Promise<void> {
    await this.client.transaction(async (tx) => {
      await tx
        .delete(userFeatureFlagsTable)
        .where(
          and(
            eq(userFeatureFlagsTable.userId, userId),
            eq(userFeatureFlagsTable.featureFlagId, featureFlagId)
          )
        )
        .execute();
      if (activityStreamData) {
        await this.logActivity({
          pk: featureFlagId,
          eventType: ActivityActions.DELETE,
          workspaceId: activityStreamData.workspaceId,
          userId: activityStreamData.userId,
          recordId: activityStreamData.recordId,
          newChanges: {},
        });
      }
    });
  }

  public async toggle(
    userId: string,
    featureFlagId: string,
    released: boolean
  ): Promise<DbUserFeatureFlags> {
    const [updatedUserFeatureFlag] = await this.client
      .update(userFeatureFlagsTable)
      .set({ released })
      .where(
        and(
          eq(userFeatureFlagsTable.userId, userId),
          eq(userFeatureFlagsTable.featureFlagId, featureFlagId)
        )
      )
      .returning();

    if (updatedUserFeatureFlag == null) {
      throw new Error(
        "Unexpected 'undefined' return for user feature flag toggle"
      );
    }

    return updatedUserFeatureFlag;
  }
}
