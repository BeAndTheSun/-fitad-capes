import { fakeMemberInvitation, fakeWorkspace } from '@meltstudio/db/tests';
import { UserRoleEnum } from '@meltstudio/types';
import {
  mockedDb,
  mockedGenerateInviteToken,
  mockedSendEmailTemplate,
} from 'tests/utils';

import { inviteMemberToWorkspace } from '@/api/services/user';
import { ServiceError } from '@/api/types/errors';

const memberInvitation = fakeMemberInvitation();
const workspace = fakeWorkspace();

describe('inviteMemberToWorkspace', () => {
  it('should invite a member to the workspace', async () => {
    const args = {
      workspaceId: workspace.id,
      email: 'test@example.com',
      role: UserRoleEnum.MEMBER,
      senderName: 'Admin',
    };
    mockedDb.workspace.findUniqueByPk.mockResolvedValue(workspace);
    mockedDb.user.findUniqueByEmail.mockResolvedValue(null);
    mockedGenerateInviteToken.mockReturnValue(memberInvitation.token);
    mockedDb.memberInvitations.findByEmailAndWorkspace.mockResolvedValue(null);
    mockedDb.memberInvitations.create.mockResolvedValue(memberInvitation);

    await inviteMemberToWorkspace(args);

    expect(mockedSendEmailTemplate).toHaveBeenCalledWith({
      template: {
        id: 'member-invitation',
        props: {
          by: 'Admin',
          workspace: workspace.name,
          token: memberInvitation.token,
        },
      },
      options: {
        to: 'test@example.com',
        subject: `You've been invited to ${workspace.name}`,
      },
    });
  });

  it('should throw an error if the workspace is not found', async () => {
    const args = {
      workspaceId: workspace.id,
      email: 'test@example.com',
      role: UserRoleEnum.MEMBER,
      senderName: 'Admin',
    };
    mockedDb.workspace.findUniqueByPk.mockResolvedValue(null);

    await expect(inviteMemberToWorkspace(args)).rejects.toThrow(ServiceError);
  });
});
