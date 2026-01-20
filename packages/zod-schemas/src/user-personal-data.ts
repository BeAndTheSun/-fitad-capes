import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertUserPersonalDataSchema,
  select: selectUserPersonalDataSchema,
  sorting: sortingUserPersonalDataSchema,
} = createSchemasForTable(schema.personalInfo);
