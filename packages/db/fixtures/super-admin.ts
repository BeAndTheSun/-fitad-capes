import 'dotenv/config';

import { cancel, intro, isCancel, outro, text } from '@clack/prompts';
import { faker } from '@faker-js/faker';
import { hashPassword } from '@meltstudio/server-common';
import { drizzle } from 'drizzle-orm/postgres-js';
import { wrapWithSpinner } from 'fixtures';
import postgres from 'postgres';
import { z } from 'zod';

import { users as usersTable } from '@/db/schema';
import * as schema from '@/db/schema';

async function createSuperAdmin(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl == null || dbUrl === '') {
    throw new Error("environment variable 'DATABASE_URL' is missing");
  }
  intro('👨‍💼 Creating super admin');

  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  const superAdminEmail = await text({
    message: "What's your e-mail?",
    validate: (value) => {
      const result = z.string().email().safeParse(value);
      if (result.success) {
        return undefined;
      }

      return 'Invalid e-mail format';
    },
  });

  if (isCancel(superAdminEmail)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const userFullName = await text({ message: "What's your full name?" });
  if (isCancel(userFullName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const superAdminPassword = await text({
    message: "What's your password?",
    validate: (value) => {
      if (value.length >= 8) {
        return undefined;
      }

      return 'Password must be at least 8 characters long';
    },
  });

  if (isCancel(superAdminPassword)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const hashedPassword = await hashPassword(superAdminPassword);

  await wrapWithSpinner('users', async () => {
    const user = await db.insert(usersTable).values({
      id: faker.string.uuid(),
      createdAt: faker.date.past().toDateString(),
      name: userFullName,
      email: superAdminEmail,
      active: true,
      password: hashedPassword,
      is2faEnabled: false,
      secret2fa: '',
      profileImage: null,
      isSuperAdmin: true,
    });
    return user;
  });

  await client.end();
  outro('👨‍💼 Super admin created');
}

createSuperAdmin().catch((err) => {
  console.error('❌ Running the script failed');
  console.error(err);
  process.exit(1);
});
