/* eslint-disable class-methods-use-this */
import type { SQL } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbFeatureFlag } from '@/db/schema';
import { featureFlag as featureFlagTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type FeatureFlagsWhere = DbWhere & {
  workspaceId?: string;
  flag?: string;
};

export class DBFeatureFlagModel extends DbModel<
  typeof featureFlagTable,
  FeatureFlagsWhere,
  'featureFlag'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'featureFlag' {
    return 'featureFlag';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof featureFlagTable {
    return featureFlagTable;
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
    return 'featureFlag';
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'featureFlag'> {
    return {
      users: {
        with: {
          user: true,
        },
      },
      workspace: true,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  protected get manyRelationsMap(): Map<string, ManyRelations> {
    this.registerManyRelations('users', 'userFeatureFlag', {
      mainKey: 'featureFlagId',
      relatedKey: 'userId',
      relatedField: 'users',
    });

    return this.dynamicManyRelationsMap;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: FeatureFlagsWhere
  ): Query {
    const conditions: (SQL | undefined)[] = [];

    if (where.workspaceId != null) {
      conditions.push(eq(this.dbTable.workspaceId, where.workspaceId));
    }

    if (where.flag != null) {
      conditions.push(eq(this.dbTable.flag, where.flag));
    }
    return query.where(and(...conditions));
  }

  public async toggle(id: string, released: boolean): Promise<DbFeatureFlag> {
    const flag = this.update({
      pk: id,
      data: { released },
    });

    if (flag == null) {
      throw new Error("Unexpected 'undefined' return for feature flag toggle");
    }

    return flag;
  }
}
