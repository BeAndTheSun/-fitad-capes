import { uuid } from 'drizzle-orm/pg-core';

import { baseFields } from './base';
import { workspace } from './workspace';

export const baseWorkspaceFields = {
  ...baseFields,
  workspaceId: uuid().references(() => workspace.id, {
    onDelete: 'cascade',
  }),
};
