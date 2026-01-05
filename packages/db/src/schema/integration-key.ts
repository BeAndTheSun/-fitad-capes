import { IntegrationType } from '@meltstudio/types';
import { pgEnum, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields, enumToPgEnum } from './base';
import { integration } from './integration';

export const integrationTypeEnum = pgEnum(
  'keyName',
  enumToPgEnum(IntegrationType)
);

export const integrationKey = pgTable(
  'integration_key',
  {
    ...baseFields,
    name: integrationTypeEnum().notNull(),
    value: text().notNull(),
    keyName: integrationTypeEnum('keyName').notNull(),
    integrationId: uuid()
      .notNull()
      .references(() => integration.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [unique().on(table.name, table.integrationId)]
);

export type DbIntegrationKey = typeof integrationKey.$inferSelect;
export type DbintegrationKeyExtended = InferResultType<
  'integrationKey',
  {
    integration: true;
  }
>;
export type DbNewIntegrationKey = typeof integrationKey.$inferInsert;
export type DbIntegrationKeySorting = TableSorting<DbIntegrationKey>;
