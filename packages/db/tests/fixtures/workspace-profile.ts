import { faker } from '@faker-js/faker';

import type { DbWorkspaceProfile } from '@/db/schema/workspace-profile';

import { fakeWorkspace } from './workspace';

export function fakeWorkspaceProfile(
  overrides: Partial<DbWorkspaceProfile> = {}
): DbWorkspaceProfile {
  return {
    workspaceId: fakeWorkspace().id,
    description: faker.lorem.paragraph(),
    linkedinUrl: faker.internet.url(),
    instagramUrl: faker.internet.url(),
    facebookUrl: faker.internet.url(),
    companyUrl: faker.internet.url(),
    ...overrides,
  };
}
