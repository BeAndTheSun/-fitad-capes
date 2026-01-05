import { UserRoleEnum } from '@meltstudio/types';
import { pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import { roleEnum, users } from '@/db/schema/users';
import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields } from './base';
import { workspace } from './workspace';

export const memberInvitations = pgTable(
  'member_invitations',
  {
    ...baseFields,

    token: varchar({ length: 256 }).notNull().unique(),
    email: varchar({ length: 256 }).notNull(),
    role: roleEnum().notNull().default(UserRoleEnum.MEMBER),
    expiresAt: timestamp().notNull(),
    userId: uuid().references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: uuid()
      .notNull()
      .references(() => workspace.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => [unique('unique_email_workspace').on(t.email, t.workspaceId)]
);

export type DbMemberInvitation = typeof memberInvitations.$inferSelect;
export type DbMemberInvitationExtended = InferResultType<
  'memberInvitations',
  {
    user: true;
    workspace: true;
  }
>;
export type DbNewMemberInvitation = typeof memberInvitations.$inferInsert;
export type DbMemberInvitationSorting = TableSorting<DbMemberInvitation>;
