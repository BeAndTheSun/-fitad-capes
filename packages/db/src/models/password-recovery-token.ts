/* eslint-disable class-methods-use-this */
import { eq } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbPasswordRecoveryToken } from '@/db/schema';
import { passwordRecoveryTokens as passwordRecoveryTokensTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbPasswordRecoveryTokenWhere = {
  userId?: string;
};

export class DbPasswordRecoveryTokenModel extends DbModel<
  typeof passwordRecoveryTokensTable,
  DbPasswordRecoveryTokenWhere,
  'passwordRecoveryTokens'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'passwordRecoveryTokens' {
    return 'passwordRecoveryTokens';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof passwordRecoveryTokensTable {
    return passwordRecoveryTokensTable;
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
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get modelName(): DbModelKeys {
    return 'passwordRecoveryToken';
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'passwordRecoveryTokens'> {
    return { user: true };
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbPasswordRecoveryTokenWhere
  ): Query {
    let filtered = query;
    if (where.userId != null) {
      filtered = filtered.where(eq(this.dbTable.userId, where.userId));
    }

    return filtered;
  }

  public async findUniqueByToken(
    token: string
  ): Promise<DbPasswordRecoveryToken | null> {
    const passwordRecoveryToken =
      await this.client.query.passwordRecoveryTokens.findFirst({
        where: eq(passwordRecoveryTokensTable.token, token),
      });
    if (passwordRecoveryToken == null) {
      return null;
    }

    return passwordRecoveryToken;
  }
}
