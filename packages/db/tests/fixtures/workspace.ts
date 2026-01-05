import { faker } from '@faker-js/faker';

import type { DbWorkspace } from '@/db/schema/workspace';

export function fakeWorkspace(
  overrides: Partial<DbWorkspace> = {}
): DbWorkspace {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    createdAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}
