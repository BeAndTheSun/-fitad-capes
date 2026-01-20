import { faker } from '@faker-js/faker';

import type { DbUser, DbUserExtended } from '@/db/schema/users';

export function fakeUser(overrides?: Partial<DbUser>): DbUser {
  const fake: DbUser = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    active: true,
    is2faEnabled: false,
    isSuperAdmin: false,
    gtmId: '',
    profileImage: '',
    createdAt: faker.date.recent().toISOString(),
    trainerName: null,
    trainerPhone: null,
    trainerEmail: null,
    trainerAddress: null,
    trainerSocialUrl: null,
    trainerBio: null,
    ...overrides,
  };

  return { ...fake, ...overrides };
}

export function fakeUserExtended(
  overrides?: Partial<DbUserExtended>
): DbUserExtended {
  const fake: DbUserExtended = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    active: true,
    is2faEnabled: false,
    isSuperAdmin: false,
    gtmId: null,
    profileImage: null,
    createdAt: faker.date.recent().toISOString(),
    trainerName: null,
    trainerPhone: null,
    trainerEmail: null,
    trainerAddress: null,
    trainerSocialUrl: null,
    trainerBio: null,
    featureFlags: [],
    workspaces: [],
    ...overrides,
  };

  return { ...fake, ...overrides };
}
