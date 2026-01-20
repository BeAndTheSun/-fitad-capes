import { eq } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import { personalInfo as userPersonalDataTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DBUserPersonalDataWhere = {
  userId: string;
};

export class DBUserPersonalDataModel extends DbModel<
  typeof userPersonalDataTable,
  DBUserPersonalDataWhere,
  'personalInfo'
> {
  public override get dbTablePkColumn(): PgColumn {
    return this.dbTable.id;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'personalInfo' {
    return 'personalInfo';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof userPersonalDataTable {
    return userPersonalDataTable;
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
    return 'userPersonalData';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'personalInfo'> {
    return { user: true };
  }

  // eslint-disable-next-line class-methods-use-this
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

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DBUserPersonalDataWhere
  ): Query {
    let filtered = query;
    if (where.userId != null) {
      filtered = filtered.where(eq(this.dbTable.userId, where.userId));
    }

    return filtered;
  }

  public async getUserPersonalData(userId: string): Promise<{
    id: string;
    userId: string;
    full_name: string;
    phone_number: string;
    fitness_goal: string;
    sponsoring: string;
  } | null> {
    const userData = await this.client.query.personalInfo.findFirst({
      where: eq(this.dbTable.userId, userId),
    });

    if (!userData) {
      return null;
    }

    return {
      id: userData.id,
      userId: userData.userId || '',
      full_name: userData.full_name || '',
      phone_number: userData.phone_number || '',
      fitness_goal: userData.fitness_goal || '',
      sponsoring: userData.sponsoring || '',
    };
  }
}
