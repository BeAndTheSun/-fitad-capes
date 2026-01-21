/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { OpenAIClient } from '@meltstudio/ai';
import { logger } from '@meltstudio/logger';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { and, cosineDistance, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DbClient } from '@/db/models/client';
import type * as tableSchemaType from '@/db/schema';
import { embeddings as embeddingsTable } from '@/db/schema';
import { dbSchemas } from '@/db/schema/tables';

type RowData = {
  id: string;
  [key: string]: unknown;
};

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

// TODO: replace this relationConfig and manyToManyConfig with the actual relations from model
const relationConfig: RelationConfig = {
  workspace: [
    {
      relationTable: 'workspaceProfile',
      foreignKey: 'workspaceId',
      localKey: 'id',
    },
  ],
  reports: [
    {
      relationTable: 'workspace',
      foreignKey: 'id',
      localKey: 'workspaceId',
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
  users: [
    {
      joinTable: 'userWorkspaces',
      primaryForeignKey: 'userId',
      relatedForeignKey: 'workspaceId',
      relatedTable: 'workspace',
    },
  ],
};

const BATCH_SIZE = 50;

export class VectorDBService {
  private db: PostgresJsDatabase<typeof tableSchemaType>;

  private openai: OpenAIClient;

  private tableSchemas:
    | ExtractTablesWithRelations<typeof tableSchemaType>
    | undefined;

  public constructor() {
    this.db = DbClient.getClient();
    this.tableSchemas = DbClient.getTableSchemas();
    this.openai = new OpenAIClient();
  }

  // Method to embed all rows for all tables in the public schema
  public async embedAll(workspaceId: string | null): Promise<void> {
    const tablesSchema = this.tableSchemas;
    if (!tablesSchema) {
      throw new Error('Table schemas not found');
    }
    const tables = Object.values(tablesSchema).map((table) => table.tsName);
    await this.embedSomeTables(tables, workspaceId);
    logger.info('All embeddings generated and stored for all tables.');
  }

  // eslint-disable-next-line class-methods-use-this
  private filterRowData(row: RowData, table: keyof typeof dbSchemas): RowData {
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

  private async fetchRowsPaginated(
    table: keyof typeof dbSchemas,
    offset = 0,
    limit = 500
  ): Promise<RowData[]> {
    return this.db
      .select()
      .from(dbSchemas[table])
      .limit(limit)
      .offset(offset)
      .execute() as Promise<RowData[]>;
  }

  public async embedRowsBatch(
    table: keyof typeof dbSchemas,
    rows: RowData[],
    workspaceId: string | null,
    originTable?: keyof typeof dbSchemas
  ): Promise<void> {
    const filteredRows = await Promise.all(
      rows.map(async (row) =>
        this.processRowData(row, table, workspaceId, originTable)
      )
    );

    const texts = filteredRows.map(({ concatenatedData }) => concatenatedData);
    try {
      // Generate embeddings in batch
      const embeddings = await this.openai.getEmbeddings(texts);
      // Upsert embeddings for each filtered row
      const upsertPromises = filteredRows.map(async (filteredRow, index) => {
        const { rowId, filterRow } = filteredRow;
        const embedding = embeddings[index];
        if (embedding) {
          await this.upsertEmbedding(
            table,
            rowId,
            filterRow,
            embedding,
            workspaceId
          );
        }
      });

      // Await all upserts to complete
      await Promise.all(upsertPromises);
    } catch (error) {
      logger.error(`Failed to generate embeddings for ${table}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async processRowData(
    row: RowData,
    table: keyof typeof dbSchemas,
    workspaceId: string | null,
    originTable?: keyof typeof dbSchemas
  ): Promise<{ rowId: string; filterRow: RowData; concatenatedData: string }> {
    const filterRow: RowData = { id: row.id };

    // Filter the initial row data and add to the keys the prefix of the table
    const filteredRow = this.filterRowData(row, table);
    Object.assign(filterRow, filteredRow);

    let concatenatedData = `Record from ${table}:\n`;

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
        const relatedRows = (await this.db
          .select()
          .from(dbSchemas[relation.relationTable])
          .where(eq(relatedField as PgColumn, row.id))
          .execute()) as RowData[];

        // Filter related rows data
        const filteredRelatedRows = relatedRows.map((r) =>
          this.filterRowData(r, relation.relationTable)
        );

        // Initialize the related table key in filterRow
        const relatedData = filterRow[relation.relationTable] || [];

        if (Array.isArray(relatedData)) {
          relatedData.push(...filteredRelatedRows);
          filterRow[relation.relationTable] = relatedData;
        }

        let relationsText = '';
        relatedRows.forEach((relatedRow) => {
          const filteredRelatedRow = this.filterRowData(
            relatedRow,
            relation.relationTable
          );
          relationsText += `\nFrom ${relation.relationTable} related to ${table}: `;
          relationsText += `${Object.entries(filteredRelatedRow)
            .map(
              ([key, value]) => `${key.replace('-', ' ')}: ${value as string}`
            )
            .join('. ')}. `;
        });
        concatenatedData += relationsText;
        if (relation.relationTable !== originTable) {
          await this.updateRelatedEmbeddings(
            relation.relationTable,
            table,
            workspaceId,
            [],
            relation.foreignKey,
            row.id
          );
        }
      }
    }

    const manyToManyConfigTable = manyToManyConfig[table];
    // Handle many-to-many related data
    if (manyToManyConfigTable) {
      for (const relation of manyToManyConfigTable) {
        const jointTable = dbSchemas[relation.joinTable];
        const primaryForeignKey =
          jointTable[relation.primaryForeignKey as keyof typeof jointTable];
        // Get related IDs from the join table
        const relatedJoinData = await this.db
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
          const relatedRows = (await this.db
            .select()
            .from(relatedTable)
            .where(inArray(relatedTable.id, relatedIds))
            .execute()) as RowData[];

          // Filter related rows data
          const filteredRelatedRows = relatedRows.map((r) =>
            this.filterRowData(r, relation.relatedTable)
          );

          // Initialize the related table key in filterRow
          const relatedData = filterRow[relation.relatedTable] || [];

          if (Array.isArray(relatedData)) {
            relatedData.push(...filteredRelatedRows);
            filterRow[relation.relatedTable] = relatedData;
          }

          let manyRelationText = '';
          filteredRelatedRows.forEach((relatedRow) => {
            const filteredRelatedRow = this.filterRowData(
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
          if (relation.relatedTable !== originTable) {
            await this.updateRelatedEmbeddings(
              relation.relatedTable,
              table,
              workspaceId,
              relatedIds
            );
          }
        }
      }
    }

    return { rowId: row.id, filterRow, concatenatedData };
  }

  // Method to embed some tables and add an optional to avoid some rows
  public async embedSomeTables(
    tables: (keyof typeof dbSchemas)[],
    workspaceId: string | null
  ): Promise<void> {
    try {
      logger.info('🔍 Generating embeddings for selected tables');
      const tablesSchema = this.tableSchemas;
      if (!tablesSchema) throw new Error('Schema not loaded');

      for (const table of tables) {
        let offset = 0;
        let rows;
        do {
          rows = await this.fetchRowsPaginated(table, offset, BATCH_SIZE);
          if (rows.length === 0) break;

          await this.embedRowsBatch(table, rows, workspaceId);
          offset += BATCH_SIZE;
        } while (rows.length === BATCH_SIZE);
      }
    } catch (error) {
      const e = error as Error;
      logger.error(`Failed to embed tables: ${e.message}`);
    } finally {
      logger.info('Embeddings generated and stored for selected tables.');
    }
  }

  // Upsert embedding into the embeddings table using Drizzle
  private async upsertEmbedding(
    table: string,
    rowId: string,
    data: Record<string, unknown>,
    embedding: number[],
    workspaceId: string | null
  ): Promise<void> {
    await this.db
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

  private async updateRelatedEmbeddings(
    relatedTable: keyof typeof dbSchemas,
    originTable: keyof typeof dbSchemas, // parameter to avoid infinite loops
    workspaceId: string | null,
    relatedIds: string[] = [],
    foreignKey?: string,
    primaryId?: string
  ): Promise<void> {
    let relatedRows: RowData[] = [];
    const rdTable = dbSchemas[relatedTable];

    if ('id' in rdTable) {
      if (primaryId && foreignKey) {
        // Fetch related rows for a one-to-many relationship
        relatedRows = (await this.db
          .select()
          .from(rdTable)
          .where(
            eq(
              rdTable[foreignKey as keyof typeof rdTable] as PgColumn,
              primaryId
            )
          )
          .execute()) as RowData[];
      } else if (relatedIds.length > 0) {
        // Fetch related rows for a many-to-many relationship

        relatedRows = (await this.db
          .select()
          .from(rdTable)
          .where(inArray(rdTable.id, relatedIds))
          .execute()) as RowData[];
      } else {
        logger.error(`No related rows found for ${relatedTable}`);
        return;
      }
      await this.embedRowsBatch(
        relatedTable,
        relatedRows,
        workspaceId,
        originTable
      );
    }
  }

  // Method to update an embedding when the data changes
  public async updateEmbedding(
    table: keyof typeof dbSchemas,
    workspaceId: string | null,
    rowId: string
  ): Promise<void> {
    const row = await this.db
      .select()
      .from(embeddingsTable)
      .where(eq(embeddingsTable.id, rowId))
      .execute();
    if (row.length > 0 && row[0]) {
      await this.embedRowsBatch(table, row, workspaceId);
    }
  }

  public async saveEmbedding(
    table: string,
    rowId: string,
    data: Record<string, unknown>,
    embedding: number[],
    workspaceId: string | null
  ): Promise<void> {
    await this.upsertEmbedding(table, rowId, data, embedding, workspaceId);
  }

  // Method to remove an embedding using Drizzle
  public async removeEmbedding(table: string, rowId: string): Promise<void> {
    await this.db
      .delete(embeddingsTable)
      .where(
        and(
          eq(embeddingsTable.tableName, table),
          eq(embeddingsTable.rowId, rowId)
        )
      )
      .execute();
  }

  // Query embeddings based on user input
  public async queryEmbedding(args: {
    userQuery: string;
    workspaceId?: string;
  }): Promise<string[] | null> {
    const { userQuery, workspaceId } = args;
    const queryEmbeddings = await this.openai.getEmbeddings(userQuery);
    const embedding = queryEmbeddings[0] || [];

    const similarity = sql<number>`1 - (${cosineDistance(embeddingsTable.embedding, embedding)})`;

    const conditions = [gt(similarity, 0.5)];

    if (workspaceId) {
      conditions.push(eq(embeddingsTable.workspaceId, workspaceId));
    }

    const result = await this.db
      .select({ data: embeddingsTable.data, similarity })
      .from(embeddingsTable)
      .where(and(...conditions))
      .orderBy((t) => desc(t.similarity))
      .limit(10);

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
}
