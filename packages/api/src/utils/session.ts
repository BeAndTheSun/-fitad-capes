import type { DbUser } from '@meltstudio/db';
import { sendEmailTemplate } from '@meltstudio/mailing';
import { hashPassword } from '@meltstudio/server-common';

import { db } from '@/api/db';
import type { CreateUserParams } from '@/api/types/users';

export async function createNewUser(
  args: CreateUserParams,
  withWorkspace = true
): Promise<DbUser> {
  const { email, name, password, workspaceId, role } = args;

  const hashedPassword = await hashPassword(password);

  // TODO: Add transaction
  const user = await db.user.create({
    data: {
      name,
      email,
      active: true,
      password: hashedPassword,
    },
  });

  if (withWorkspace && workspaceId) {
    await db.userWorkspaces.create({
      data: {
        userId: user.id,
        workspaceId,
        ...(role && { role }),
      },
    });
  }

  await db.user.handleAlgoliaSaveByPk(user.id);

  await sendEmailTemplate({
    template: {
      id: 'welcome',
      props: {},
    },
    options: {
      to: user.email,
      subject: 'Welcome to the Turborepo template!',
    },
  });

  return user;
}
