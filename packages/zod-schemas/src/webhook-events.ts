import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertWebhookEventsSchema,
  select: selectWebhookEventsSchema,
  sorting: sortingWebhookEventsSchema,
} = createSchemasForTable(dbSchemas.webhookEvents);
