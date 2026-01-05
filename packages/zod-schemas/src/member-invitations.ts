import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertMemberInvitationSchema,
  select: selectMemberInvitationSchema,
  sorting: sortingMemberInvitationSchema,
} = createSchemasForTable(schema.memberInvitations);
