import type { DbUser } from '@meltstudio/db';
import { UserRoleEnum } from '@meltstudio/types';

import { db } from '@/api/db';
import type { CreateUserParams } from '@/api/types/users';
import { createNewUser } from '@/api/utils/session';

export const createMemberInWorkspace = async (
  workspaceId: string,
  userParams: Omit<CreateUserParams, 'workspaceId' | 'role'>
): Promise<{ user: DbUser; isNew: boolean; addedToWorkspace: boolean }> => {
  const { email, name, password } = userParams;

  const existingUser = await db.user.findUniqueByEmail(email);

  if (!existingUser) {
    // Create new user
    const newUser = await createNewUser({
      email,
      name,
      password,
      workspaceId,
      role: UserRoleEnum.MEMBER,
    });

    return { user: newUser, isNew: true, addedToWorkspace: true };
  }

  // Check if user is already in the workspace
  const userWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
    existingUser.id,
    workspaceId
  );

  if (userWorkspace) {
    // already exists in workspace
    return { user: existingUser, isNew: false, addedToWorkspace: false };
  }

  // Add to workspace
  await db.userWorkspaces.create({
    data: {
      userId: existingUser.id,
      workspaceId,
      role: UserRoleEnum.MEMBER,
    },
    activityStreamData: {
      userId: existingUser.id,
      workspaceId,
    },
  });

  await db.user.handleAlgoliaSaveByPk(existingUser.id);
  return { user: existingUser, isNew: false, addedToWorkspace: true };
};
