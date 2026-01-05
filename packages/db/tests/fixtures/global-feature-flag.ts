import { faker } from '@faker-js/faker';

import type { DbGlobalFeatureFlags } from '@/db/schema/global-feature-flags';

export function fakeGlobalFeatureFlag(
  overrides: Partial<DbGlobalFeatureFlags> = {}
): DbGlobalFeatureFlags {
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.recent().toISOString(),
    flag: faker.string.alpha({ length: 10 }).toLowerCase(),
    description: faker.lorem.sentence(),
    released: faker.datatype.boolean(),
    allowWorkspaceControl: false,
    ...overrides,
  };
}
