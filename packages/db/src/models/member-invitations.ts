/* eslint-disable class-methods-use-this */
import { and, eq } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbMemberInvitation } from '@/db/schema/member-invitations';
import { memberInvitations } from '@/db/schema/member-invitations';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbMemberInvitationWhere = {
  token?: string;
  email?: string;
};

export class DbMemberInviteModel extends DbModel<
  typeof memberInvitations,
  DbMemberInvitationWhere,
  'memberInvitations'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'memberInvitations' {
    return 'memberInvitations';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof memberInvitations {
    return memberInvitations;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get adminFieldChoiceName(): string {
    return 'token';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'memberInvitations';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'memberInvitations'> {
    return { user: true, workspace: true };
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    this.registerManyRelations('users', 'memberInvitations', {
      mainKey: 'id',
      relatedKey: 'userId',
      relatedField: 'user',
    });

    return this.dynamicManyRelationsMap;
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbMemberInvitationWhere
  ): Query {
    let filtered = query;
    if (where.token != null) {
      filtered = filtered.where(eq(this.dbTable.token, where.token));
    }

    if (where.email != null) {
      filtered = filtered.where(eq(this.dbTable.email, where.email));
    }

    return filtered;
  }

  public async findByEmailAndWorkspace(
    email: string,
    workspaceId: string
  ): Promise<DbMemberInvitation | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(
        and(
          eq(this.dbTable.email, email),
          eq(this.dbTable.workspaceId, workspaceId)
        )
      )
      .execute();

    return data || null;
  }

  public async findByToken(token: string): Promise<DbMemberInvitation | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.token, token))
      .execute();

    return data || null;
  }
}
