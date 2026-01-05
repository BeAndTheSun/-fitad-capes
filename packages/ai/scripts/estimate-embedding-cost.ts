/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import 'dotenv/config';

import { intro, outro } from '@clack/prompts';
import { dbSchemas } from '@meltstudio/db';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { encoding_for_model } from 'tiktoken';

import * as schema from '@/db/schema';

const dbUrl = process.env.DATABASE_URL;
if (dbUrl == null || dbUrl === '') {
  throw new Error("environment variable 'DATABASE_URL' is missing");
}

const client = postgres(dbUrl, { max: 1 });
const db = drizzle(client, { schema });
// Function to calculate the number of tokens using tiktoken
function calculateTokens(text: string): number {
  const encoder = encoding_for_model('text-embedding-ada-002');
  const tokens = encoder.encode(text);
  return tokens.length;
}

// Function to estimate the total cost for embedding a table
async function estimateEmbeddingCost(
  tableName: keyof typeof dbSchemas
): Promise<number> {
  intro(`Estimating cost for embedding data in ${tableName}`);
  // Fetch all records from the table
  const records = await db.select().from(dbSchemas[tableName]).execute();

  let totalTokens = 0;

  for (const record of records) {
    // Concatenate the record fields into a single string
    const recordString = JSON.stringify(record);

    // Calculate tokens for this record
    const tokenCount = calculateTokens(recordString);

    // Accumulate total tokens
    totalTokens += tokenCount;
  }

  // Calculate cost: $0.0004 per 1,000 tokens
  const costPerThousandTokens = 0.0004;
  const totalCost = (totalTokens / 1000) * costPerThousandTokens;

  outro(`Total tokens for ${tableName}: ${totalTokens}`);
  outro(
    `Estimated cost for embedding data in ${tableName}: $${totalCost.toFixed(4)}`
  );

  return totalCost;
}

// Function to estimate the cost for all tables
async function estimateCostForAllTables(): Promise<void> {
  const tables: (keyof typeof dbSchemas)[] = ['users', 'workspace'];
  let totalCost = 0;
  for (const table of tables) {
    const total = await estimateEmbeddingCost(table);
    totalCost += total;
  }

  outro(`Total estimated cost for embedding data: $${totalCost.toFixed(4)}`);

  await client.end();
}

// Run the cost estimation
estimateCostForAllTables().catch((error) => {
  console.error('Error estimating cost:', error);
  process.exit(1);
});
