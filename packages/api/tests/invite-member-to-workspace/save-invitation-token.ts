import { fakeMemberInvitation, fakeWorkspace } from '@meltstudio/db/tests';
import { UserRoleEnum } from '@meltstudio/types';
import {
  mockedDb,
  mockedGenerateInviteToken,
  mockedSendEmailTemplate,
} from 'tests/utils';

import { saveInvitationToken } from '@/api/services/user/invite-member-to-workspace';
import { ServiceError } from '@/api/types/errors';

const invitation = fakeMemberInvitation();
const workspace = fakeWorkspace();

describe('saveInvitationToken', () => {
  it('should save a new invitation token', async () => {
    const args = {
      workspaceId: workspace.id,
      email: 'test@example.com',
      role: UserRoleEnum.MEMBER,
      senderName: 'Admin',
    };
    mockedDb.memberInvitations.findByEmailAndWorkspace.mockResolvedValue(null);
    mockedGenerateInviteToken.mockReturnValue('invite-token');
    mockedDb.memberInvitations.create.mockResolvedValue(invitation);

    const token = await saveInvitationToken(args);

    expect(token).toBe('invite-token');
  });

  it('should reuse an existing valid token', async () => {
    const args = {
      workspaceId: workspace.id,
      email: 'test@example.com',
      role: UserRoleEnum.MEMBER,
      senderName: 'Admin',
    };
    mockedDb.memberInvitations.findByEmailAndWorkspace.mockResolvedValue(
      invitation
    );

    const token = await saveInvitationToken(args);

    expect(token).toBe(invitation.token);
  });

  it('should throw an error if token creation fails', async () => {
    const args = {
      workspaceId: '1',
      email: 'test@example.com',
      role: UserRoleEnum.MEMBER,
    };
    mockedDb.memberInvitations.findByEmailAndWorkspace.mockResolvedValue(null);

    await expect(mockedSendEmailTemplate(args)).rejects.toThrow(ServiceError);
  });
});
