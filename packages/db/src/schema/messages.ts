import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import type { TableSorting } from './base';
import { baseFields, enumToPgEnum } from './base';
import { chat } from './chats';
import { users } from './users';

export enum MessageDirection {
  Inbound = 'inbound',
  Outgoing = 'outgoing',
}

export const messageDirectionEnum = pgEnum(
  'direction',
  enumToPgEnum(MessageDirection)
);

export const message = pgTable('message', {
  ...baseFields,
  chatId: uuid()
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  direction: messageDirectionEnum().notNull(),
  userId: uuid().references(() => users.id, { onDelete: 'cascade' }),
  senderId: uuid(),
  content: text().notNull(),
});

export type DbMessage = typeof message.$inferSelect;
export type DbNewMessage = typeof message.$inferInsert;
export type DbMessageSorting = TableSorting<DbMessage>;
