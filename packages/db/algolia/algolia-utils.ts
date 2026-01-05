/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { cancel, isCancel, log, spinner, text } from '@clack/prompts';
import type { AlgoliaClientInstance } from '@meltstudio/algolia-client';
import { getTableName } from 'drizzle-orm';

import type { AlgoliaRecord, DbModelRecord, TableRow } from './types';
import { BATCH_SIZE } from './types';

// Function to format data for Algolia, using the single primary key
function formatDataForAlgolia(
  data: TableRow[],
  tableName: string,
  primaryKeyColumn: string
): AlgoliaRecord[] {
  // Throw an error if no primary key is provided as Algolia requires it
  if (!primaryKeyColumn) {
    throw new Error(`No primary key found for table ${tableName}`);
  }

  return data.map((row) => {
    const objectID = row[primaryKeyColumn];

    if (
      objectID === undefined ||
      objectID === null ||
      typeof objectID === 'object' ||
      typeof objectID === 'boolean'
    ) {
      throw new Error(
        `Primary key value is missing for record in table ${tableName}`
      );
    }

    return {
      objectID: `${(objectID as string | number).toString()}`, // Convert to string to avoid Algolia error
      row,
    };
  });
}

export async function deleteIndexesIfExists(
  client: AlgoliaClientInstance,
  indexNames: string[]
): Promise<void> {
  const dropData = await text({
    message:
      'Do you want to delete Algolia indexes? (This is recommended if it was synced before)',
    validate: (value) => {
      if (value === 'yes' || value === 'no') {
        return undefined;
      }
      return 'Please type "yes" or "no"';
    },
  });

  if (isCancel(dropData)) {
    cancel('❌ Operation cancelled.');
    process.exit(0);
  }

  if (dropData === 'yes') {
    const promises = indexNames.map(async (indexName) => {
      try {
        await client.deleteIndex({ indexName });
      } catch (error) {
        log.error(`⛔ No existing index to delete for table: ${indexName}`);
      }
    });

    await Promise.all(promises);
    log.info('🗑️  All indexes deleted successfully!');
  }
}

// Sync function for each table
export async function syncTableToAlgolia(
  dbModel: DbModelRecord
): Promise<void> {
  const s = spinner();
  const tableName = getTableName(dbModel.dbTableModel);

  const { algoliaModel } = dbModel;

  s.start(`✨ Syncing table: ${tableName}`);

  if (!algoliaModel) {
    s.stop(`❗ Table ${tableName} has no Algolia model!`);
  } else {
    const mmm = algoliaModel.getDataClass();

    await mmm.syncIndex();

    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      try {
        const data = await mmm.getManyFromDb({
          pagination: { limit: BATCH_SIZE, offset },
        });

        const primaryKeyColumn = algoliaModel.pkColumn?.name;

        if (data.length === 0) {
          s.stop(`❗ Table ${tableName} is empty!`);
          break;
        }

        if (!primaryKeyColumn) {
          throw new Error(`No primary key found for table ${tableName}`);
        }

        const formattedData = formatDataForAlgolia(
          data,
          tableName,
          primaryKeyColumn
        );

        if (formattedData.length > 0) {
          await mmm.updateManyInAlgolia(formattedData);

          s.message(
            `🔵 Synced ${formattedData.length} records from table ${tableName} starting at offset ${offset}`
          );
        }

        if (formattedData.length < BATCH_SIZE) {
          hasMoreData = false;
          s.message(`🚀 All records from table ${tableName} synced!`);
          s.stop(`✅ Table ${tableName} synced successfully!`);
        }

        offset += BATCH_SIZE;
      } catch (error) {
        const e = error as Error;
        s.stop(
          `🚨 Error syncing table ${tableName} starting at offset ${offset}: ${e.message}`
        );
        hasMoreData = false; // Exit the loop in case of an error
      }
    }
  }
}
