import 'dotenv/config';

import { cancel, intro, isCancel, outro, spinner, text } from '@clack/prompts';
import { faker } from '@faker-js/faker';
import { DEFAULT_FEATURE_FLAGS } from '@meltstudio/types';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

import type {
  DbNewFeatureFlag as FeatureFlag,
  DbUserWithPassword as User,
  DbUserWorkspaces as UserWorkspaces,
} from '@/db';
import * as schema from '@/db/schema';
import {
  featureFlag as featureFlagsTable,
  globalFeatureFlags as globalFeatureFlagsTable,
  users as usersTable,
  userWorkspaces,
  workspaceProfile,
} from '@/db/schema';
import { workspace } from '@/db/schema/workspace';

import { emptyDBTables } from './empty-database-tables';

// IMPORTANT: the full fixtures can be kept in a single file as long as it makes
// sense, if the file becomes too large at some point it can be split into
// multiple files

export async function wrapWithSpinner<T>(
  table: string,
  cb: () => Promise<T>
): Promise<T> {
  const s = spinner();
  s.start(`⌛️ Creating ${table}.`);

  const result = await cb();

  s.stop(`✅ Created ${table}.`);

  return result;
}

async function createFixtures(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl == null || dbUrl === '') {
    throw new Error("environment variable 'DATABASE_URL' is missing");
  }

  intro('Creating database fixtures');

  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  // Drop all data
  const dropData = await text({
    message: 'Do you want to drop all data?',
    validate: (value) => {
      if (value === 'yes' || value === 'no') {
        return undefined;
      }

      return 'Please type "yes" or "no"';
    },
  });

  if (isCancel(dropData)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  if (dropData === 'yes') {
    await emptyDBTables(db);
  }

  const workspaceName = await text({
    message: "What's the workspace name?",
  });
  if (isCancel(workspaceName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const workspaceId = faker.string.uuid();

  // Workspaces
  const workspaces = await wrapWithSpinner('workspace', async () => {
    const workspacesToCreate = Array(3)
      .fill(0)
      .map(() => ({
        id: faker.string.uuid(),
        createdAt: faker.date.past().toDateString(),
        name: `Workspace ${faker.company.name()}`,
      }));

    workspacesToCreate.push({
      id: workspaceId,
      createdAt: faker.date.past().toDateString(),
      name: workspaceName,
    });

    await db.insert(workspace).values(workspacesToCreate);

    return workspacesToCreate;
  });

  // Create Workspace Profile
  await wrapWithSpinner('workspace_profile', async () => {
    const workspaceProfilesToCreate = workspaces.map((w) => ({
      workspaceId: w.id,
      description: faker.lorem.sentence(),
      logoFile: '',
    }));

    await db.insert(workspaceProfile).values(workspaceProfilesToCreate);

    return workspaceProfilesToCreate;
  });

  const userEmail = await text({
    message: "What's your e-mail?",
    validate: (value) => {
      const result = z.string().email().safeParse(value);
      if (result.success) {
        return undefined;
      }

      return 'Invalid e-mail format';
    },
  });
  if (isCancel(userEmail)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  const userFullName = await text({ message: "What's your full name?" });
  if (isCancel(userFullName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const userId = faker.string.uuid();

  const users = await wrapWithSpinner('users', async () => {
    const usersToCreate: User[] = Array(20)
      .fill(0)
      .map((): User => {
        const name = faker.person.fullName();

        return {
          id: faker.string.uuid(),
          createdAt: faker.date.past().toDateString(),
          name,
          email: faker.internet.email({ firstName: name }).toLowerCase(),
          active: true,
          password: '',
          is2faEnabled: false,
          secret2fa: '',
          profileImage: null,
          trainerName: null,
          trainerPhone: null,
          trainerEmail: null,
          trainerAddress: null,
          trainerSocialUrl: null,
          trainerBio: null,
          isSuperAdmin: false,
          gtmId: '',
        };
      });

    // add an active user for the developer
    usersToCreate.push({
      id: userId,
      createdAt: faker.date.past().toDateString(),
      name: userFullName,
      email: userEmail,
      active: true,
      // hashed password for 'qwe123asd'
      password: '$2b$12$T7RRI1QfYCH4HdN7ziK2mOr3IWUkeIHSH2KIO1lzg5GrWSCqjM97K',
      is2faEnabled: false,
      secret2fa: '',
      profileImage: null,
      trainerName: null,
      trainerPhone: null,
      trainerEmail: null,
      trainerAddress: null,
      trainerSocialUrl: null,
      trainerBio: null,
      isSuperAdmin: false,
      gtmId: '',
    });

    await db.insert(usersTable).values(usersToCreate);

    return usersToCreate;
  });

  // User workspaces
  await wrapWithSpinner('user_workspaces', async () => {
    const userWorkspacesToCreate: UserWorkspaces[] = [];

    // add the developer to all workspaces
    workspaces.forEach((w) => {
      userWorkspacesToCreate.push({
        userId,
        workspaceId: w.id,
        role: 'admin',
      });
    });

    // add some users to some workspaces, should respect the unique constraint userId, workspaceId
    if (users[0] && workspaces[0]) {
      userWorkspacesToCreate.push({
        userId: users[0].id,
        workspaceId: workspaces[0].id,
        role: 'member',
      });
    }

    if (users[1] && workspaces[0]) {
      userWorkspacesToCreate.push({
        userId: users[1].id,
        workspaceId: workspaces[0].id,
        role: 'member',
      });
    }

    if (users[2] && workspaces[1]) {
      userWorkspacesToCreate.push({
        userId: users[2].id,
        workspaceId: workspaces[1].id,
        role: 'member',
      });
    }

    await db.insert(userWorkspaces).values(userWorkspacesToCreate);

    return userWorkspacesToCreate;
  });

  await wrapWithSpinner('global_feature_flags', async () => {
    const globalFlagsToCreate = DEFAULT_FEATURE_FLAGS.map((f) => ({
      flag: f.flag,
      description: f.description,
      released: f.released,
      allowWorkspaceControl: false,
    }));

    await db
      .insert(globalFeatureFlagsTable)
      .values(globalFlagsToCreate)
      .onConflictDoNothing();

    return globalFlagsToCreate;
  });

  await wrapWithSpinner('feature_flags', async () => {
    const globalFlags = await db.query.globalFeatureFlags.findMany();
    const globalFlagMap = new Map(globalFlags.map((f) => [f.flag, f.id]));

    const featureFlagsToCreate: FeatureFlag[] = workspaces.flatMap((w) =>
      DEFAULT_FEATURE_FLAGS.map((defaultFlag) => {
        const globalId = globalFlagMap.get(defaultFlag.flag);

        if (!globalId) {
          throw new Error(
            `GlobalFeatureFlag with flag ${defaultFlag.flag} not found`
          );
        }

        return {
          flag: defaultFlag.flag,
          description: defaultFlag.description,
          released: defaultFlag.released,
          workspaceId: w.id,
          globalFeatureFlagId: globalId,
        };
      })
    );

    await db.insert(featureFlagsTable).values(featureFlagsToCreate);

    return featureFlagsToCreate;
  });

  await client.end();
  outro('Successfully created database fixtures!');
}

createFixtures().catch((err) => {
  console.error('❌ Running fixtures failed');
  console.error(err);
  process.exit(1);
});
