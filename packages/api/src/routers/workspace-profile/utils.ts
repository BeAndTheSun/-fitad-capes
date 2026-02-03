import { IntegrationHooks } from '@meltstudio/common';
import type { ActivityActions } from '@meltstudio/types';
import { UserRoleEnum } from '@meltstudio/types';

import { db } from '@/api/db';
import { inviteMultipleMembersToWorkspace } from '@/api/services/user';

export async function processMembers({
  workspaceId,
  members,
  senderName,
}: {
  workspaceId: string;
  members: { email: string; role: UserRoleEnum }[];
  senderName: string;
  senderId: string;
}): Promise<void> {
  if (members.length > 0) {
    await inviteMultipleMembersToWorkspace({
      workspaceId,
      senderName,
      members,
    });
  }
}

export async function ensureCreatorInWorkspace({
  workspaceId,
  creatorId,
  senderId,
  includeCreator,
}: {
  workspaceId: string;
  creatorId: string;
  senderId: string;
  includeCreator?: boolean;
}): Promise<void> {
  if (!includeCreator) return;

  const creatorInWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
    creatorId,
    workspaceId
  );

  if (!creatorInWorkspace) {
    await db.userWorkspaces.create({
      data: {
        userId: creatorId,
        workspaceId,
        role: UserRoleEnum.ADMIN,
      },
      activityStreamData: {
        userId: senderId,
        workspaceId,
      },
    });
  }
}

export async function triggerIntegrationHooks({
  workspaceId,
  members,
  eventType,
}: {
  workspaceId: string;
  members: { email: string; role: string }[];
  eventType: ActivityActions;
}): Promise<void> {
  await Promise.all(
    members.map((member) =>
      IntegrationHooks.onAddUser(member, workspaceId, eventType)
    )
  );
}
