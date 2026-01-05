import {
  generateInviteToken,
  INVITATION_TOKEN_EXP_DAYS,
} from '@meltstudio/auth';
import { sendEmailTemplate } from '@meltstudio/mailing';
import type { UserRoleEnum } from '@meltstudio/types';
import { addDays, isAfter } from 'date-fns';

import { db } from '@/api/db';
import { ServiceError } from '@/api/types/errors';

export type InviteMemberArgs = {
  workspaceId: string;
  email: string;
  role: UserRoleEnum;
  senderName: string;
};

export type InviteMultipleMembersArgs = {
  workspaceId: string;
  senderName: string;
  members: {
    email: string;
    role: UserRoleEnum;
  }[];
};

async function getWorkspaceById(workspaceId: string): Promise<{
  id: string;
  name: string;
  createdAt: string;
}> {
  const workspace = await db.workspace.findUniqueByPk(workspaceId);

  if (!workspace) {
    throw new ServiceError('Workspace not found', 400);
  }
  return workspace;
}

async function validateUserNotInWorkspace({
  workspaceId,
  email,
}: InviteMemberArgs): Promise<void> {
  const destinyUser = await db.user.findUniqueByEmail(email);

  if (destinyUser) {
    const userWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
      destinyUser.id,
      workspaceId
    );
    if (userWorkspace) {
      throw new ServiceError('User already in workspace', 400);
    }
  }
}

async function validateMultipleUserNotInWorkspace({
  workspaceId,
  members,
}: InviteMultipleMembersArgs): Promise<void> {
  const destinyUsers = await db.user.findManyByEmail(
    members.map(({ email }) => email)
  );

  if (destinyUsers.length) {
    const usersInWorkspace =
      await db.userWorkspaces.findManyByUserIdAndWorkspaceId(
        destinyUsers.map(({ id }) => id),
        workspaceId
      );
    if (usersInWorkspace.length) {
      throw new ServiceError('User already in workspace', 400);
    }
  }
}

export async function saveInvitationToken({
  workspaceId,
  email,
  role,
}: InviteMemberArgs): Promise<string> {
  // Check if there is a token already generated
  let data = null;
  const existingToken = await db.memberInvitations.findByEmailAndWorkspace(
    email,
    workspaceId
  );

  // Reuse token if still valid
  if (
    existingToken &&
    isAfter(existingToken.expiresAt, new Date()) &&
    !existingToken.userId
  ) {
    data = existingToken;
  } else {
    const token = generateInviteToken();

    // Send email
    data = await db.memberInvitations.create({
      data: {
        email,
        token,
        role,
        expiresAt: addDays(new Date(), INVITATION_TOKEN_EXP_DAYS),
        workspaceId,
      },
    });
  }

  if (!data) {
    throw new ServiceError('Failed to create invitation', 500);
  }
  return data.token;
}

export async function saveMultipleInvitationTokens({
  workspaceId,
  members,
}: InviteMultipleMembersArgs): Promise<{ email: string; token: string }[]> {
  const memberCreateQueries = members.map((member) => {
    const token = generateInviteToken();
    return {
      email: member.email,
      token,
      role: member.role,
      expiresAt: addDays(new Date(), INVITATION_TOKEN_EXP_DAYS),
      workspaceId,
    };
  });

  // Send email
  await db.memberInvitations.createMany({
    data: memberCreateQueries,
  });
  return memberCreateQueries.map(({ email, token }) => ({ email, token }));
}

export async function inviteMemberToWorkspace(
  args: InviteMemberArgs
): Promise<void> {
  const { workspaceId, email, senderName } = args;
  const workspace = await getWorkspaceById(workspaceId);
  await validateUserNotInWorkspace(args);
  const token = await saveInvitationToken(args);
  await sendEmailTemplate({
    template: {
      id: 'member-invitation',
      props: {
        by: senderName,
        workspace: workspace.name,
        token,
      },
    },
    options: {
      to: email,
      subject: `You've been invited to ${workspace.name}`,
    },
  });
}

export async function inviteMultipleMembersToWorkspace(
  args: InviteMultipleMembersArgs
): Promise<void> {
  const { workspaceId, senderName } = args;
  const workspace = await getWorkspaceById(workspaceId);
  await validateMultipleUserNotInWorkspace(args);
  const tokensByEmail = await saveMultipleInvitationTokens(args);
  await Promise.all(
    tokensByEmail.map(({ email, token }) =>
      sendEmailTemplate({
        template: {
          id: 'member-invitation',
          props: {
            by: senderName,
            workspace: workspace.name,
            token,
          },
        },
        options: {
          to: email,
          subject: `You've been invited to ${workspace.name}`,
        },
      })
    )
  );
}
