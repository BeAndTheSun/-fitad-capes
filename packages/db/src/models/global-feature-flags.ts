import { eq } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import { globalFeatureFlags as globalFeatureFlagsTable } from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbGlobalFeatureFlagsWhere = {
  flag?: string;
};

export class DbGlobalFeatureFlagsModel extends DbModel<
  typeof globalFeatureFlagsTable,
  DbGlobalFeatureFlagsWhere,
  'globalFeatureFlags'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'globalFeatureFlags' {
    return 'globalFeatureFlags';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof globalFeatureFlagsTable {
    return globalFeatureFlagsTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'name';
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'globalFeatureFlags';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbGlobalFeatureFlagsWhere
  ): Query {
    let filtered = query;

    if (where.flag != null) {
      filtered = filtered.where(eq(this.dbTable.flag, where.flag));
    }

    return filtered;
  }
}
