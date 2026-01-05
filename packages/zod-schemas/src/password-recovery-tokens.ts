import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertPasswordRecoveryTokenSchema,
  select: selectPasswordRecoveryTokenSchema,
  sorting: sortingPasswordRecoveryTokenSchema,
} = createSchemasForTable(schema.passwordRecoveryTokens, {
  insert: {
    id: (s) => s.uuid(),
  },
  select: {
    id: (s) => s.uuid(),
  },
});
