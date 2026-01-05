import { IntegrationsKeys } from '@meltstudio/types';
import { boolean, pgEnum, pgTable, unique, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields, enumToPgEnum } from './base';
import { workspace } from './workspace';

export const platformEnum = pgEnum('platform', enumToPgEnum(IntegrationsKeys));

export const integration = pgTable(
  'integration',
  {
    ...baseFields,

    platform: platformEnum().notNull(),
    enabled: boolean().notNull(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspace.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [unique().on(table.platform, table.workspaceId)]
);

export type DbIntegration = typeof integration.$inferSelect;
export type DbIntegrationExtended = InferResultType<
  'integration',
  {
    integrationKeys: true;
  }
>;
export type DbNewIntegration = typeof integration.$inferInsert;
export type DbIntegrationSorting = TableSorting<DbIntegration>;
