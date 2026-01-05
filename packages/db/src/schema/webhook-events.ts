import { ActivityActions, IntegrationResponseStatus } from '@meltstudio/types';
import { jsonb, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { baseFields, enumToPgEnum } from './base';
import { webhooks } from './webhooks';
import { workspace } from './workspace';

// TODO: Remove this field
export enum TableNames {
  FEATURE_FLAGS = 'feature_flag',
  MEMBER_INVITATIONS = 'member_invitation',
  PASSWORD_RECOVERY_TOKENS = 'password_recovery_token',
  USER_FEATURE_FLAGS = 'user_feature_flag',
  USER_WORKSPACES = 'user_workspace',
  USERS = 'user',
  WORKSPACES = 'workspace',
  WORKSPACE_PROFILE = 'workspace_profile',
  REPORTS = 'reports',
}

export const responseStatusEnum = pgEnum(
  'status',
  enumToPgEnum(IntegrationResponseStatus)
);

export const eventTypeEnum = pgEnum(
  'event_type',
  enumToPgEnum(ActivityActions)
);

export const eventTableNameEnum = pgEnum(
  'event_table_name',
  enumToPgEnum(TableNames)
);

export const webhookEvents = pgTable('webhook-events', {
  ...baseFields,

  targetUrl: text().notNull(),
  payload: jsonb().notNull(),
  response: jsonb(),
  status: responseStatusEnum().notNull(),
  errorMessage: text(),
  name: text().notNull(),
  eventType: eventTypeEnum().notNull(),
  eventTableName: eventTableNameEnum().notNull(),
  workspaceId: uuid()
    .notNull()
    .references(() => workspace.id, {
      onDelete: 'cascade',
    }),
  webhookId: uuid()
    .notNull()
    .references(() => webhooks.id, { onDelete: 'cascade' }),
});

export type DbWebhookEvents = typeof webhookEvents.$inferSelect;
