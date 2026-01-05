import { fakeMemberInvitation, fakeWorkspace } from '@meltstudio/db/tests';
import { UserRoleEnum } from '@meltstudio/types';
import {
  mockedDb,
  mockedGenerateInviteToken,
  mockedSendEmailTemplate,
} from 'tests/utils';

import { inviteMultipleMembersToWorkspace } from '@/api/services/user';

const workspace = fakeWorkspace();
const invitation = fakeMemberInvitation();
const invitation2 = fakeMemberInvitation();

describe('inviteMultipleMembersToWorkspace', () => {
  it('should invite multiple members to the workspace', async () => {
    const args = {
      workspaceId: workspace.id,
      senderName: 'Admin',
      members: [
        { email: 'member1@example.com', role: UserRoleEnum.MEMBER },
        { email: 'member2@example.com', role: UserRoleEnum.MEMBER },
      ],
    };
    mockedDb.workspace.findUniqueByPk.mockResolvedValue(workspace);
    mockedDb.user.findManyByEmail.mockResolvedValue([]);
    mockedGenerateInviteToken.mockReturnValue('invite-token');
    mockedDb.memberInvitations.createMany.mockResolvedValue([
      invitation,
      invitation2,
    ]);

    await inviteMultipleMembersToWorkspace(args);

    expect(mockedSendEmailTemplate).toHaveBeenCalledTimes(2);
  });
});
