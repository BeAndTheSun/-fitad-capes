/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import 'dotenv/config';

import { intro, outro, spinner } from '@clack/prompts';
import { AlgoliaClient } from '@meltstudio/algolia-client';
import { Db } from '@meltstudio/db';
import { getTableName } from 'drizzle-orm';

import { deleteIndexesIfExists, syncTableToAlgolia } from './algolia-utils';

// Main function to sync all tables
async function syncAllTablesToAlgolia(): Promise<void> {
  intro('🔄 Syncing database to Algolia');
  const s = spinner();

  // Connect to Algolia and database
  s.start('📡 Connecting to database');
  const client = AlgoliaClient.createAlgoliaClient();
  const db = new Db();

  // Get tables
  s.message('📥 Fetching all tables');
  const models = Object.values(db.models);
  const tables = models.map((m) => getTableName(m.dbTableModel));
  s.stop(`🔍 Found ${tables.length} tables to sync.`);

  // Drop all data
  await deleteIndexesIfExists(client, tables);

  // We need to handle one by one as data is managed in batches
  s.start('🔄 Starting indexes sync...');

  for (const model of models) {
    await syncTableToAlgolia(model);
  }

  outro('🎉 Tables synced successfully!');
  process.exit(0);
}

// Run the full sync process
syncAllTablesToAlgolia().catch((error) => {
  console.error('❌ Database sync failed');
  console.error(error);
  process.exit(1);
});
