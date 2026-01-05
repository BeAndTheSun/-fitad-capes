import { ilike } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

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
}
