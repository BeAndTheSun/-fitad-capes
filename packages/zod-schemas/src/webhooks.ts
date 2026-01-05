import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertWebhooksSchema,
  select: selectWebhooksSchema,
  sorting: sortingWebhooksSchema,
} = createSchemasForTable(dbSchemas.webhooks);
