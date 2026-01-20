import { pgTable, primaryKey, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { workspace } from './workspace';

export const workspaceProfile = pgTable(
  'workspace_profile',
  {
    workspaceId: uuid('workspace_id')
      .references(() => workspace.id, { onDelete: 'cascade' })
      .notNull(),
    description: text().notNull(),

    instagramUrl: varchar({ length: 256 }),
    facebookUrl: varchar({ length: 256 }),
    companyUrl: varchar({ length: 256 }),
    linkedinUrl: varchar({ length: 256 }),
  },
  (t) => [primaryKey({ columns: [t.workspaceId] })]
);

export type DbWorkspaceProfile = typeof workspaceProfile.$inferSelect;
export type DbNewWorkspaceProfile = typeof workspaceProfile.$inferInsert;
