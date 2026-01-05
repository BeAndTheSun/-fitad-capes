/* eslint-disable class-methods-use-this */

import { and, eq } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbMessage } from '@/db/schema';
import { message as messagesTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type MessageWhere = DbWhere & {
  chatId?: string;
};

export class DbMessageModel extends DbModel<
  typeof messagesTable,
  MessageWhere,
  'message'
> {
  protected override get isExportable(): boolean {
    throw new Error('Method not implemented.');
  }

  protected override get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  protected get adminFieldChoiceName(): string {
    return 'name';
  }

  public override get schemaTsName(): 'message' {
    return 'message';
  }

  protected get dbTable(): typeof messagesTable {
    return messagesTable;
  }

  protected get modelName(): DbModelKeys {
    return 'message';
  }

  protected get activityStream(): boolean {
    return false;
  }

  protected override get queryRelations(): GetQueryRelations<'message'> {
    return {
      chat: true,
    };
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: MessageWhere
  ): Query {
    const conditions = [];
    if (where.chatId != null) {
      conditions.push(eq(this.dbTable.chatId, where.chatId));
    }

    return query.where(and(...conditions));
  }

  public async findMessagesByChat(chatId: string): Promise<DbMessage[] | null> {
    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.chatId, chatId))
      .execute();

    return data || null;
  }
}
