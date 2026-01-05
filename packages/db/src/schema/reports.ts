import { ReportStatusEnum } from '@meltstudio/types/src/reports';
import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseFields, enumToPgEnum } from '@/db/schema/base';

export const reportStatusEnum = pgEnum(
  'report_status',
  enumToPgEnum(ReportStatusEnum)
);

export const reports = pgTable('reports', {
  ...baseFields,
  name: varchar({ length: 256 }).notNull(),
  workspaceId: uuid('workspace_id').notNull(),
  downloadUrl: varchar({ length: 256 }),
  from: timestamp('from', { mode: 'string' }).notNull(),
  to: timestamp('to', { mode: 'string' }).notNull(),
  reportStatus: reportStatusEnum('report_status').default(
    ReportStatusEnum.PENDING
  ),
  exportedTable: varchar({ length: 256 }).notNull(),
});

export type DbReports = typeof reports.$inferSelect;
