/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import 'dotenv/config';

import { intro, outro } from '@clack/prompts';
import { OpenAIClient } from '@meltstudio/ai';
import { cosineDistance, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/db/schema';
import { embeddings as embeddingsTable } from '@/db/schema';
import { dbSchemas } from '@/db/schema/tables';

type RowData = {
  id: string;
  [key: string]: unknown;
};

const BATCH_SIZE = 50;
const dbUrl = process.env.DATABASE_URL;
if (dbUrl == null || dbUrl === '') {
  throw new Error("environment variable 'DATABASE_URL' is missing");
}

const client = postgres(dbUrl, { max: 1 });
const db = drizzle(client, { schema, logger: false });

// Initialize OpenAI
const openai = new OpenAIClient();

type RelationConfig = Partial<{
  [table in keyof typeof dbSchemas]: {
    relationTable: keyof typeof dbSchemas;
    foreignKey: string;
    localKey: string;
  }[];
}>;

type ManyToManyConfig = Partial<{
  [table in keyof typeof dbSchemas]: {
    joinTable: keyof typeof dbSchemas;
    primaryForeignKey: string; // Foreign key in the join table linking to the primary table
    relatedForeignKey: string; // Foreign key in the join table linking to the related table
    relatedTable: keyof typeof dbSchemas;
  }[];
}>;

const relationConfig: RelationConfig = {
  workspace: [
    {
      relationTable: 'workspaceProfile',
      foreignKey: 'workspaceId',
      localKey: 'id',
    },
  ],
};

const manyToManyConfig: ManyToManyConfig = {
  workspace: [
    {
      joinTable: 'userWorkspaces',
      primaryForeignKey: 'workspaceId',
      relatedForeignKey: 'userId',
      relatedTable: 'users',
    },
  ],
};
// Get embeddings for a given text
function filterRowData(row: RowData, table: keyof typeof dbSchemas): RowData {
  const avoidKeyRows = ['password', 'secret'];
  const filterRow: RowData = { id: row.id };

  Object.entries(row).forEach(([key, value]) => {
    if (
      typeof value === 'string' &&
      !avoidKeyRows.some((r) => key.includes(r))
    ) {
      filterRow[`${table}-${key}`] = value;
    }
  });
  return filterRow;
}

async function processRowData(
  row: RowData,
  table: keyof typeof dbSchemas
): Promise<{
  rowId: string;
  filterRow: RowData;
  concatenatedData: string;
  workspaceId?: string;
}> {
  const filterRow: RowData = { id: row.id };

  // Filter the initial row data and add to the keys the prefix of the table
  const filteredRow = filterRowData(row, table);
  Object.assign(filterRow, filteredRow);

  let concatenatedData = `Record from ${table}:\n`;

  // let concatenatedData = `Details of ${table}: `;
  concatenatedData += `${Object.entries(filterRow)
    .map(
      ([columnName, value]) =>
        `${columnName.replace('-', ' ')}: ${value as string}`
    )
    .join('. ')}. `;

  // Fetch and concatenate one-to-many related data
  const relationConfigTable = relationConfig[table];
  if (relationConfigTable) {
    for (const relation of relationConfigTable) {
      const relatedTable = dbSchemas[relation.relationTable];
      const relatedField =
        relatedTable[relation.foreignKey as keyof typeof relatedTable];
      const relatedRows = (await db
        .select()
        .from(dbSchemas[relation.relationTable])
        .where(eq(relatedField as PgColumn, row.id))
        .execute()) as RowData[];

      // Filter related rows data
      const filteredRelatedRows = relatedRows.map((relatedRow) => {
        return filterRowData(relatedRow, relation.relationTable);
      });

      // Initialize the related table key in filterRow
      const relatedData = filterRow[relation.relationTable] || [];

      if (Array.isArray(relatedData)) {
        relatedData.push(...filteredRelatedRows);
        filterRow[relation.relationTable] = relatedData;
      }

      // Append descriptions of one-to-many relationships
      let relationsText = '';
      relatedRows.forEach((relatedRow) => {
        const filteredRelatedRow = filterRowData(
          relatedRow,
          relation.relationTable
        );
        relationsText += `\nFrom ${relation.relationTable} related to ${table}: `;
        relationsText += `${Object.entries(filteredRelatedRow)
          .map(([key, value]) => `${key.replace('-', ' ')}: ${value as string}`)
          .join('. ')}. `;
      });
      concatenatedData += relationsText;
    }
  }

  // Handle many-to-many related data
  const manyToManyConfigTable = manyToManyConfig[table];
  if (manyToManyConfigTable) {
    for (const relation of manyToManyConfigTable) {
      const jointTable = dbSchemas[relation.joinTable];
      const primaryForeignKey =
        jointTable[relation.primaryForeignKey as keyof typeof jointTable];
      // Get related IDs from the join table
      const relatedJoinData = await db
        .select()
        .from(dbSchemas[relation.joinTable])
        .where(eq(primaryForeignKey as PgColumn, row.id))
        .execute();

      // Get related IDs from the join table
      const relatedIds: string[] = [];
      relatedJoinData.forEach((relatedIdObj: { [key: string]: string }) => {
        const obj = relatedIdObj[relation.relatedForeignKey];
        if (obj) {
          relatedIds.push(obj);
        }
      });

      // Fetch related data from the related table
      const relatedTable = dbSchemas[relation.relatedTable];
      if ('id' in relatedTable) {
        const relatedRows = (await db
          .select()
          .from(relatedTable)
          .where(inArray(relatedTable.id, relatedIds))
          .execute()) as RowData[];

        // Filter related rows data
        const filteredRelatedRows = relatedRows.map((relatedRow) => {
          return filterRowData(relatedRow, relation.relatedTable);
        });

        // Initialize the related table key in filterRow
        const relatedData = filterRow[relation.relatedTable] || [];

        if (Array.isArray(relatedData)) {
          relatedData.push(...filteredRelatedRows);
          filterRow[relation.relatedTable] = relatedData;
        }

        let manyRelationText = '';
        filteredRelatedRows.forEach((relatedRow) => {
          const filteredRelatedRow = filterRowData(
            relatedRow,
            relation.relatedTable
          );
          manyRelationText += `\nFrom ${relation.relatedTable} via ${relation.joinTable}: `;
          manyRelationText += `${Object.entries(filteredRelatedRow)
            .map(
              ([key, value]) => `${key.replace('-', ' ')}: ${value as string}`
            )
            .join('. ')}. `;
        });

        concatenatedData += manyRelationText;
      }
    }
  }
  let workspaceId;
  if ('workspaceId' in row) {
    workspaceId = row.workspaceId as string;
  }

  if (table === 'workspace') {
    workspaceId = row.id;
  }

  return { rowId: row.id, filterRow, concatenatedData, workspaceId };
}

// Upsert embedding into the embeddings table using Drizzle
async function upsertEmbedding(args: {
  table: string;
  rowId: string;
  data: Record<string, unknown>;
  embedding: number[];
  workspaceId?: string;
}): Promise<void> {
  const { table, rowId, data, embedding, workspaceId } = args;
  await db
    .insert(embeddingsTable)
    .values({
      tableName: table,
      rowId,
      data,
      embedding,
      workspaceId,
    })
    .onConflictDoUpdate({
      target: [embeddingsTable.tableName, embeddingsTable.rowId],
      set: {
        data,
        embedding,
      },
    });
}

async function embedRowsBatch(
  table: keyof typeof dbSchemas,
  rows: RowData[]
): Promise<void> {
  const filteredRows = await Promise.all(
    rows.map(async (row) => processRowData(row, table))
  );
  const texts = filteredRows.map(({ concatenatedData }) => concatenatedData);

  // Generate embeddings in batch
  const embeddings = await openai.getEmbeddings(texts);

  // Upsert embeddings for each filtered row
  const upsertPromises = filteredRows.map(async (filteredRow, index) => {
    const { rowId, filterRow, workspaceId } = filteredRow;
    const embedding = embeddings[index];
    if (embedding) {
      await upsertEmbedding({
        table,
        rowId,
        data: filterRow,
        embedding,
        workspaceId,
      });
    }
  });

  // Await all upserts to complete
  await Promise.all(upsertPromises);
}

async function queryEmbedding(userQuery: string): Promise<string[] | null> {
  outro('Querying embeddings for the user query');
  const queryEmbeddings = await openai.getEmbeddings(userQuery);
  const embedding = queryEmbeddings[0] || [];

  const similarity = sql<number>`1 - (${cosineDistance(embeddingsTable.embedding, embedding)})`;

  const result = await db
    .select({ data: embeddingsTable.data, similarity })
    .from(embeddingsTable)
    .where(gt(similarity, 0.4))
    .orderBy((t) => desc(t.similarity))
    .limit(7);

  if (result.length > 0) {
    const data: string[] = [];
    for (const row of result) {
      if (typeof row.data === 'object') {
        data.push(JSON.stringify(row.data));
      }
    }
    return data;
  }
  return null;
}

export async function testQueryEmbedding(): Promise<void> {
  const query = 'Data about the workspace: Workspace Altenwerth - Legros';
  const result = await queryEmbedding(query);
  if (result) {
    // eslint-disable-next-line no-console
    console.log('Query result:', result);
  } else {
    outro('No results found for the query');
  }
}

async function fetchRowsPaginated(
  table: keyof typeof dbSchemas,
  offset = 0,
  limit = 500
): Promise<RowData[]> {
  return db
    .select()
    .from(dbSchemas[table])
    .limit(limit)
    .offset(offset)
    .execute() as Promise<RowData[]>;
}

// Method to embed some tables
async function embedSomeTables(
  tables: (keyof typeof dbSchemas)[]
): Promise<void> {
  try {
    intro('🔍 Generating embeddings for selected tables');
    const tablesSchema = db._.schema;
    if (!tablesSchema) throw new Error('Schema not loaded');

    for (const table of tables) {
      let offset = 0;
      let rows;
      do {
        rows = await fetchRowsPaginated(table, offset, BATCH_SIZE);
        if (rows.length === 0) break;

        await embedRowsBatch(table, rows);
        offset += BATCH_SIZE;
      } while (rows.length === BATCH_SIZE);
    }
  } catch (error) {
    const e = error as Error;
    outro(`Failed to embed tables: ${e.message}`);
    process.exit(1);
  } finally {
    await client.end();
    outro('🎉 Embeddings generated and stored for selected tables.');
  }
}

// TODO: Remove after testing
// export async function completeText(
//   messages: ChatCompletionMessageParam[],
//   model = 'gpt-4o-mini',
//   temperature = 0,
//   maxTokens = 1000
// ): Promise<string> {
//   const response = await openai.chat.completions.create({
//     model,
//     messages,
//     temperature,
//     max_tokens: maxTokens,
//   });
//   return response.choices[0]?.message?.content || '';
// }

// export async function processInput(input: string): Promise<string> {
//   const delimiter = '```';
//   const queryResult = await queryEmbedding(input);

//   // Set system message to set appropriate context
//   const systemMessage =
//     'You are a friendly chatbot. We send a relevant information based on our database. Respond to the user with a friendly, conversational tone, summarizing the key points and answering their query in a natural way.';

//   // prepare the messages for the completion
//   const messages: ChatCompletionMessageParam[] = [
//     {
//       role: 'system',
//       content: systemMessage,
//     },
//     {
//       role: 'user',
//       content: `${delimiter}${input}${delimiter}`,
//     },
//     {
//       role: 'assistant',
//       content: queryResult
//         ? `Relevant Information: \n${queryResult.join('\n')}`
//         : 'No relevant information found.',
//     },
//   ];

//   // get the completion
//   const completion = await completeText(messages);

//   outro('Input processed successfully');
//   outro(completion);
//   return completion;
// }

embedSomeTables(['workspace', 'users', 'reports']).catch((error) => {
  console.error('An error occurred while embedding data');
  console.error(error);
  process.exit(1);
});

// TODO: Remove after testing
// processInput('Give me more information about Workspace 1')
//   .then(() => {
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error('An error occurred while processing input');
//     console.error(error);
//     process.exit(1);
//   });
