import { faker } from '@faker-js/faker';

import type { DbMemberInvitation } from '@/db/schema/member-invitations';

export function fakeMemberInvitation(
  overrides?: Partial<DbMemberInvitation>
): DbMemberInvitation {
  return {
    id: faker.string.uuid(),
    workspaceId: faker.string.uuid(),
    email: faker.internet.email(),
    role: 'member',
    createdAt: faker.date.recent().toISOString(),
    token: faker.string.uuid(),
    expiresAt: faker.date.future(),
    userId: faker.string.uuid(),
    ...overrides,
  };
}

export function testFake(): DbMemberInvitation {
  return fakeMemberInvitation();
}
