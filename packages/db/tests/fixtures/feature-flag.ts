import { faker } from '@faker-js/faker';

import type { DbFeatureFlag } from '@/db/schema/feature-flag';

import { fakeGlobalFeatureFlag } from './global-feature-flag';
import { fakeWorkspace } from './workspace';

export function fakeFeatureFlag(
  overrides?: Partial<DbFeatureFlag>
): DbFeatureFlag {
  const fake: DbFeatureFlag = {
    id: faker.string.uuid(),
    description: faker.lorem.words(),
    createdAt: faker.date.recent().toISOString(),
    flag: faker.word.words(),
    released: true,
    workspaceId: fakeWorkspace().id,
    globalFeatureFlagId: fakeGlobalFeatureFlag().id,
    ...overrides,
  };

  return { ...fake, ...overrides };
}
