import { createSchemasForTable, dbSchemas } from '@meltstudio/db';
import { z } from 'zod';

import { selectIntegrationKeySchema } from './integration-key';

export const {
  insert: insertIntegrationSchema,
  select: selectIntegrationSchema,
  sorting: sortingIntegrationSchema,
} = createSchemasForTable(dbSchemas.integration, {
  insert: {
    id: (s) => s.uuid(),
  },
  select: {
    id: (s) => s.uuid(),
  },
});

export const selectIntegrationWithKeysSchema = selectIntegrationSchema.merge(
  z.object({
    integrationKeys: z.array(selectIntegrationKeySchema),
  })
);
