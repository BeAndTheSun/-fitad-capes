/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable max-classes-per-file */
import type { ActivityStreamData, RowEmbeddingData } from '@meltstudio/types';
import { ActivityActions } from '@meltstudio/types';
import type { InferSelectModel, Table } from 'drizzle-orm';
import {
  asc,
  desc,
  eq,
  getTableColumns,
  getTableName,
  inArray,
  sql,
} from 'drizzle-orm';
import type {
  PgColumn,
  PgInsertValue,
  PgSelect,
  PgSelectBase,
  PgSelectDynamic,
  PgTableWithColumns,
  PgUpdateSetSource,
  TableConfig,
} from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type {
  GetSelectTableName,
  GetSelectTableSelection,
  SelectResult,
} from 'drizzle-orm/query-builders/select.types';

// eslint-disable-next-line import/no-extraneous-dependencies
import { handleWebhookEvent } from '@/common/handlers/webhook/handler-event';
import type { AlgoliaDataConfigCl } from '@/db/algolia/model/base';
import { algoliaTablesHistory } from '@/db/algolia/model/tables-history';
import * as schema from '@/db/schema';
import type {
  GenericDbQueryClient,
  GetQueryRelations,
  SchemaAccessibleName,
} from '@/db/utils';
import { VectorDBService } from '@/db/vector';

import type { Db } from '.';
import { DbClient } from './client';
import type { DbModelKeys } from './db';

const logger = console;

type Client = PostgresJsDatabase<typeof schema>;

type ChangeTypeOfKeys<T extends object, NewType> = {
  [key in keyof T]: NewType;
};

export type DbWhere = {
  search?: string;
};

export type ManyRelations = {
  relationModel: DbModelKeys;
  model: DbModelKeys;
  foreignKeys: { mainKey: string; relatedKey: string; relatedField: string };
};

const getUniqueRelations = (
  relations: Map<string, ManyRelations>
): ManyRelations[] => {
  const uniqueMap = new Map<string, ManyRelations>();
  const uniqueRelations = new Set<string>();
  relations.forEach((relation) => {
    uniqueMap.set(relation.relationModel, relation);
    uniqueRelations.add(relation.relationModel);
  });

  return Array.from(uniqueMap.values());
};

type DbModelSelectResult<TTable extends Table> = SelectResult<
  GetSelectTableSelection<TTable>,
  'single',
  Record<TTable['_']['name'], 'not-null'>
>;

export type DbModelPagination = {
  limit: number;
  offset: number;
};

type DbModelSorting<TTable extends Table> = {
  column: keyof TTable['_']['columns'];
  order: 'asc' | 'desc';
};

type DbModelFindManyArgs<DbModelWhere, DbModelTable extends Table> = {
  pagination?: DbModelPagination;
  where?: DbModelWhere;
  sorting?: DbModelSorting<DbModelTable>[];
};

/**
 * Base abstract class for DRY usage with Drizzle.
 */
export abstract class DbModel<
  DbModelTable extends PgTableWithColumns<{
    name: DbModelTableName;
    schema: undefined;
    columns: DbModelTableColumns;
    dialect: 'pg';
  }>,
  DbModelWhere,
  DbModelTSName extends SchemaAccessibleName,
  DbModelTableName extends TableConfig['name'] = DbModelTable['_']['name'],
  DbModelTableColumns extends
    TableConfig['columns'] = DbModelTable['_']['columns'],
  DbSelectMode extends 'single' | 'partial' | 'multiple' = 'single',
  ColumnSelection extends Partial<
    ChangeTypeOfKeys<DbModelTableColumns, true>
  > = Partial<ChangeTypeOfKeys<DbModelTableColumns, true>>,
> {
  protected abstract get dbTable(): DbModelTable;
  protected abstract get adminFieldChoiceName(): string;
  protected abstract get isExportable(): boolean;
  protected abstract get modelName(): DbModelKeys;
  public abstract get schemaTsName(): DbModelTSName;
  public abstract get saveEmbedding(): boolean;
  protected abstract get activityStream(): boolean;
  protected abstract get manyRelationsMap(): Map<string, ManyRelations>;
  protected abstract get sendWebhooks(): boolean;

  protected dynamicManyRelationsMap: Map<string, ManyRelations> = new Map<
    string,
    ManyRelations
  >();

  protected get queryRelations(): GetQueryRelations<DbModelTSName> {
    return {};
  }

  /**
   * Returns the Drizzle client instance.
   */
  protected get client(): Client {
    return DbClient.getClient();
  }

  /**
   * Service for vector embedding logic.
   */
  public get vectorDbService(): VectorDBService {
    return new VectorDBService();
  }

  public get dbTableName(): string {
    return getTableName(this.dbTable);
  }

  protected get queryClient(): GenericDbQueryClient<DbModelTSName> {
    return this.client.query[this.schemaTsName];
  }

  /**
   * The primary key column of the table.
   */
  public get dbTablePkColumn(): PgColumn {
    if (this.dbTable.id == null) {
      throw new Error(
        `DB table '${this.dbTableName}' does not contain a column named 'id'. Please override 'dbTablePkColumn' if needed.`
      );
    }
    return this.dbTable.id;
  }

  public getPrimaryKeyColumn(): PgColumn | null {
    return this.dbTablePkColumn ?? null;
  }

  public constructor(
    protected readonly db: Db,
    public readonly algoliaModel?: AlgoliaDataConfigCl<Table>
  ) {}

  /**
   * Returns the Drizzle table object (schema).
   */
  public get dbTableModel(): DbModelTable {
    return this.dbTable;
  }

  public getAdminFieldChoiceName(): string {
    return this.adminFieldChoiceName;
  }

  public getIsExportable(): boolean {
    return this.isExportable;
  }

  public getModelName(): DbModelKeys {
    return this.modelName;
  }

  /**
   * Extracts the primary key value from a row. Returns null if not found or not a string.
   */
  protected getPrimaryKeyValue(
    row: InferSelectModel<DbModelTable>
  ): string | null {
    const pkColumn = this.dbTablePkColumn;
    if (!pkColumn) {
      return null;
    }
    const pkValue = row[pkColumn.name];
    return typeof pkValue === 'string' ? pkValue : null;
  }

  /**
   * Registers many-to-many relationship information in a dynamic map.
   */
  protected registerManyRelations(
    model: DbModelKeys,
    relationModel: DbModelKeys,
    foreignKeys: {
      mainKey: string;
      relatedKey: string;
      relatedField: string;
    }
  ): void {
    const key1 = `${this.modelName}-${model}`;
    const key2 = `${model}-${this.modelName}`;
    this.dynamicManyRelationsMap.set(key1, {
      relationModel,
      foreignKeys,
      model,
    });
    this.dynamicManyRelationsMap.set(key2, {
      relationModel,
      foreignKeys,
      model,
    });
  }

  /**
   * Retrieves many-to-many relationship data from the dynamic map.
   */
  public getDynamicManyRelations(
    model: DbModelKeys
  ): ManyRelations | undefined {
    const key1 = `${this.modelName}-${model}`;
    const key2 = `${model}-${this.modelName}`;
    return this.manyRelationsMap.get(key1) || this.manyRelationsMap.get(key2);
  }

  /**
   * Loads many-to-many relationship IDs for admin usage.
   */
  private async loadRelationsByAdmin(
    relations: ManyRelations[],
    pk: string
  ): Promise<Record<string, string[]>> {
    const allRelations: Record<string, string[]> = {};

    await Promise.all(
      relations.map(async (relation) => {
        const relationModel = this.db.getModel(relation.relationModel);
        const model = this.db.getModel(relation.model);
        const { mainKey, relatedKey } = relation.foreignKeys;

        const mainColumn =
          relationModel.dbTableModel[
            mainKey as keyof typeof relationModel.dbTableModel
          ];
        if (!mainColumn) {
          throw new Error(
            `DB table '${relation.model}' has no column named '${mainKey}'.`
          );
        }

        const relatedColumn =
          relationModel.dbTableModel[
            relatedKey as keyof typeof relationModel.dbTableModel
          ];
        if (!relatedColumn) {
          throw new Error(
            `DB table '${relation.model}' has no column named '${relatedKey}'.`
          );
        }

        const relatedRows = await this.client
          .selectDistinct()
          .from(relationModel.dbTableModel)
          .where(eq(mainColumn as PgColumn, pk))
          .leftJoin(
            model.dbTableModel,
            eq(relatedColumn as PgColumn, model.dbTablePkColumn)
          );

        const relatedRowsData = relatedRows.map((row) => {
          const data = row[model.getModelName() as keyof typeof row];
          return data[model.dbTablePkColumn.name];
        });

        allRelations[relation.foreignKeys.relatedField] = relatedRowsData;
      })
    );

    return allRelations;
  }

  // -----------------------------------------------------------------------
  // PRIVATE/PROTECTED METHODS (WITHOUT UNDERSCORES) FOR DRY USAGE
  // -----------------------------------------------------------------------

  /**
   * Inserts a single row and returns it. Throws an error if the row is undefined.
   */
  protected async insertSingleRow(
    data: PgInsertValue<DbModelTable>
  ): Promise<InferSelectModel<DbModelTable>> {
    const [createdRow] = await this.client
      .insert(this.dbTable)
      .values(data)
      .returning();

    if (!createdRow) {
      throw new Error(
        `Unexpected undefined return for insert in '${this.dbTableName}' table`
      );
    }
    return createdRow;
  }

  /**
   * Inserts multiple rows and returns them. Returns an empty array if no data is provided.
   */
  protected async insertMultipleRows(
    data: PgInsertValue<DbModelTable>[]
  ): Promise<InferSelectModel<DbModelTable>[]> {
    if (!data.length) {
      return [];
    }
    return this.client.insert(this.dbTable).values(data).returning();
  }

  /**
   * Updates a single row within a transaction, returning the updated row.
   */
  protected async updateSingleRow(
    trx: Client,
    pk: string,
    data: PgUpdateSetSource<DbModelTable>
  ): Promise<InferSelectModel<DbModelTable>> {
    const [updatedRow] = await trx
      .update(this.dbTable)
      .set(data)
      .where(eq(this.dbTablePkColumn, pk))
      .returning({ ...getTableColumns(this.dbTable) });

    if (!updatedRow) {
      throw new Error(
        `Unexpected undefined return for update in '${this.dbTableName}' table`
      );
    }
    return updatedRow;
  }

  /**
   * Updates multiple rows within a transaction by their PKs.
   * Returns the updated rows or throws if no row was updated.
   */
  protected async updateMultipleRows(
    trx: Client,
    pks: string[],
    data: PgUpdateSetSource<DbModelTable>
  ): Promise<InferSelectModel<DbModelTable>[]> {
    const updatePromises = pks.map(async (key) => {
      const result = await trx
        .update(this.dbTable)
        .set(data)
        .where(eq(this.dbTablePkColumn, key))
        .returning({ ...getTableColumns(this.dbTable) });
      return result.length > 0 ? result[0] : undefined;
    });

    const updatedRows = await Promise.all(updatePromises);
    const filteredRows = updatedRows.filter(
      Boolean
    ) as InferSelectModel<DbModelTable>[];

    if (!filteredRows.length) {
      throw new Error(
        `No records were updated in the '${this.dbTableName}' table.`
      );
    }
    return filteredRows;
  }

  /**
   * Handles Algolia save if possible, catching and logging errors.
   */
  protected async handleAlgoliaSaveIfPossible(
    row: InferSelectModel<DbModelTable>
  ): Promise<void> {
    const pk = this.getPrimaryKeyValue(row);
    if (pk) {
      try {
        await this.algoliaModel?.getDataClass()?.updateInAlgolia(pk);
      } catch (error) {
        logger.error(`Error updating Algolia for PK: ${pk}`, error);
      }
    }
  }

  /**
   * Handles Algolia deletion if possible, catching and logging errors.
   */
  protected async handleAlgoliaRemoveIfPossible(pk: string): Promise<void> {
    try {
      await this.algoliaModel?.getDataClass()?.deleteFromAlgolia(pk);
    } catch (error) {
      logger.error(`Error deleting Algolia for PK: ${pk}`, error);
    }
  }

  /**
   * Logs activity if activityStream is enabled.
   * NOTE: If `workspaceId` is not in your `tables_history` table, do not include it in the record.
   */
  protected async logActivityIfNeeded(params: {
    pk: string | null;
    eventType: ActivityActions;
    userId: string;
    workspaceId?: string | null;
    recordId?: string | null;
    newChanges: Record<string, unknown>;
    oldChanges?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.activityStream) return;

    const {
      pk,
      eventType,
      userId,
      newChanges,
      oldChanges,
      workspaceId,
      recordId,
    } = params;

    try {
      let oldData = {};
      // For create events, skip fetching old data
      if (eventType !== ActivityActions.CREATE) {
        if (oldChanges) {
          oldData = oldChanges;
        } else if (pk) {
          // fetch the record to store it as old data
          const rows = await this.client
            .select()
            .from(this.dbTable)
            .where(eq(this.dbTablePkColumn, pk));

          oldData = rows.length > 0 ? (rows[0] ?? {}) : {};
          try {
            await algoliaTablesHistory.getDataClass().updateInAlgolia(pk);
          } catch (algoliaError) {
            logger.error(
              `Error updating Algolia for table record with pk: ${pk}`,
              algoliaError
            );
          }
        }
      }

      const [historyRecord] = await this.client
        .insert(schema.tablesHistory)
        .values({
          userId,
          tableName: this.dbTableName,
          workspaceId,
          recordId,
          action: eventType,
          actionDescription: {
            new: newChanges,
            old: oldData,
          },
        })
        .returning();

      if (historyRecord?.id) {
        try {
          await algoliaTablesHistory
            .getDataClass()
            .updateInAlgolia(historyRecord.id);
        } catch (algoliaError) {
          logger.error(
            `Error updating Algolia for tables-history record: ${historyRecord.id}`,
            algoliaError
          );
        }
      }
    } catch (error) {
      logger.error('Error creating record on table history');
    }
  }

  /**
   * Sends webhook events if webhooks are enabled.
   */
  protected async sendWebhookIfNeeded(params: {
    eventType: ActivityActions;
    workspaceId: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.sendWebhooks) return;

    const { eventType, workspaceId, data } = params;

    try {
      const urlsWebhooks =
        await this.db.webhooks.findUrlsAndNamesByWorkspaceId(workspaceId);

      const sendWebhook = async ({
        url,
        name,
        id,
        eventTypes,
      }: {
        url: string;
        name: string;
        id: string;
        eventTypes: string[];
      }): Promise<void> => {
        const eventKey = `${this.dbTableName}_${eventType}`;

        if (!eventTypes.includes(eventKey)) {
          logger.info(
            `Webhook skipped: eventKey '${eventKey}' not found in eventTypes for webhook '${name}'`
          );
          return;
        }

        const eventDate = new Date();

        const webhookPayload = {
          eventDate,
          eventType,
          eventTableName: this.dbTableName,
          data,
        };

        const webhookBody = {
          payload: webhookPayload,
          workspaceId,
          targetUrl: url,
          name,
          webhookId: id,
        };

        const { status, response, errorMessage } =
          await handleWebhookEvent(webhookBody);

        await this.db.webhookEvents.create({
          data: {
            targetUrl: url,
            payload: webhookPayload,
            response,
            status,
            errorMessage,
            workspaceId,
            name,
            webhookId: id,
            eventType,
            eventTableName: this.dbTableName,
          },
        });

        logger.info(
          `Webhook sent successfully to ${url} for table '${this.dbTableName}' and event '${eventType}'`
        );
      };

      await Promise.all(urlsWebhooks.map(sendWebhook));
    } catch (error) {
      logger.error(
        `Error in sendWebhookIfNeeded for table '${this.dbTableName}' and event '${eventType}':`,
        error
      );
    }
  }

  // -----------------------------------------------------------------------
  // ABSTRACT METHOD FOR FILTERING
  // -----------------------------------------------------------------------
  protected abstract filterQuery<
    Query extends
      | PgSelectDynamic<
          PgSelectBase<
            GetSelectTableName<DbModelTable>,
            DbModelTableColumns,
            DbSelectMode
          >
        >
      | PgSelect,
  >(query: Query, where: DbModelWhere): Query;

  // -----------------------------------------------------------------------
  // PAGINATION AND SORTING METHODS
  // -----------------------------------------------------------------------
  protected paginateQuery<
    Query extends
      | PgSelectDynamic<
          PgSelectBase<
            GetSelectTableName<DbModelTable>,
            DbModelTableColumns,
            DbSelectMode
          >
        >
      | PgSelect,
  >(query: Query, pagination: DbModelPagination): Query {
    if (!pagination) {
      return query;
    }
    return (query.limit(pagination.limit) as Query).offset(
      pagination.offset
    ) as Query;
  }

  protected sortQuery<
    Query extends
      | PgSelectDynamic<
          PgSelectBase<
            GetSelectTableName<DbModelTable>,
            DbModelTableColumns,
            DbSelectMode
          >
        >
      | PgSelect,
  >(query: Query, sorting: DbModelSorting<DbModelTable>[]): Query {
    if (!sorting || !sorting.length) {
      return query;
    }
    return query.orderBy(
      ...sorting.map((s) =>
        s.order === 'asc'
          ? asc(this.dbTable[s.column])
          : desc(this.dbTable[s.column])
      )
    ) as Query;
  }

  protected defaultSortQuery<
    Query extends
      | PgSelectDynamic<
          PgSelectBase<
            GetSelectTableName<DbModelTable>,
            DbModelTableColumns,
            DbSelectMode
          >
        >
      | PgSelect,
  >(query: Query): Query {
    // By default, sort by createdAt (descending) if present
    if (this.dbTable.createdAt) {
      return query.orderBy(desc(this.dbTable.createdAt)) as Query;
    }
    return query;
  }

  // -----------------------------------------------------------------------
  // PUBLIC (EXPORTED) METHODS — SIGNATURES UNCHANGED
  // -----------------------------------------------------------------------

  public async create({
    data,
    activityStreamData,
  }: {
    data: PgInsertValue<DbModelTable>;
    activityStreamData?: ActivityStreamData;
  }): Promise<InferSelectModel<DbModelTable>> {
    const createdRow = await this.insertSingleRow(data);

    await this.handleAlgoliaSaveIfPossible(createdRow);

    if (activityStreamData) {
      await this.logActivityIfNeeded({
        pk: null,
        eventType: ActivityActions.CREATE,
        userId: activityStreamData.userId,
        workspaceId: activityStreamData.workspaceId,
        recordId:
          activityStreamData.recordId ?? (createdRow.id as string | null),
        newChanges: createdRow,
      });
    }

    if (this.saveEmbedding) {
      await this.vectorDbService.embedRowsBatch(
        this.schemaTsName,
        [createdRow as unknown as RowEmbeddingData],
        activityStreamData?.workspaceId ?? null
      );
    }

    if (this.sendWebhooks) {
      await this.sendWebhookIfNeeded({
        eventType: ActivityActions.CREATE,
        workspaceId: activityStreamData?.workspaceId ?? '',
        data: createdRow,
      });
    }

    return createdRow;
  }

  public async createByAdmin<T>({
    data,
    activityStreamData,
  }: {
    data: T;
    activityStreamData?: ActivityStreamData;
  }): Promise<InferSelectModel<DbModelTable>> {
    const [createdRow] = await this.client
      .insert(this.dbTable)
      .values(data as PgInsertValue<DbModelTable>)
      .returning();

    if (!createdRow) {
      throw new Error(
        `Unexpected undefined return for insert in '${this.dbTableName}' table`
      );
    }

    await this.handleAlgoliaSaveIfPossible(createdRow);

    if (activityStreamData) {
      await this.logActivityIfNeeded({
        pk: null,
        eventType: ActivityActions.CREATE,
        userId: activityStreamData.userId,
        workspaceId: activityStreamData.workspaceId,
        recordId:
          activityStreamData.recordId ?? (createdRow.id as string | null),
        newChanges: createdRow,
      });
    }

    if (this.saveEmbedding) {
      await this.vectorDbService.embedRowsBatch(
        this.schemaTsName,
        [createdRow as unknown as RowEmbeddingData],
        activityStreamData?.workspaceId ?? null
      );
    }

    if (this.sendWebhooks) {
      await this.sendWebhookIfNeeded({
        eventType: ActivityActions.CREATE,
        workspaceId: activityStreamData?.workspaceId ?? '',
        data: createdRow,
      });
    }

    return createdRow;
  }

  public async createMany({
    data,
    activityStreamData,
  }: {
    data: PgInsertValue<DbModelTable>[];
    activityStreamData?: ActivityStreamData;
  }): Promise<InferSelectModel<DbModelTable>[]> {
    const createdRows = await this.insertMultipleRows(data);

    await Promise.all(
      createdRows.map((row) => this.handleAlgoliaSaveIfPossible(row))
    );

    if (activityStreamData) {
      await Promise.allSettled(
        createdRows.map((record) =>
          this.logActivityIfNeeded({
            pk: null,
            eventType: ActivityActions.CREATE,
            userId: activityStreamData.userId,
            workspaceId: activityStreamData.workspaceId,
            recordId:
              activityStreamData.recordId ?? (record.id as string | null),
            newChanges: record,
          })
        )
      );
    }

    if (this.saveEmbedding) {
      await this.vectorDbService.embedRowsBatch(
        this.schemaTsName,
        createdRows as unknown as RowEmbeddingData[],
        activityStreamData?.workspaceId ?? null
      );
    }

    if (this.sendWebhooks) {
      await Promise.allSettled(
        createdRows.map((record) =>
          this.sendWebhookIfNeeded({
            eventType: ActivityActions.CREATE,
            workspaceId: activityStreamData?.workspaceId ?? '',
            data: record,
          })
        )
      );
    }

    return createdRows;
  }

  public async createManyByAdmin({
    data,
    activityStreamData,
  }: {
    data: Partial<DbModelTable['$inferInsert']>[];
    activityStreamData?: ActivityStreamData;
  }): Promise<InferSelectModel<DbModelTable>[]> {
    const rowData = data as PgInsertValue<DbModelTable>[];
    const createdRows = await this.insertMultipleRows(rowData);

    await Promise.all(
      createdRows.map((row) => this.handleAlgoliaSaveIfPossible(row))
    );

    if (activityStreamData) {
      await Promise.allSettled(
        createdRows.map((record) =>
          this.logActivityIfNeeded({
            pk: null,
            eventType: ActivityActions.CREATE,
            userId: activityStreamData.userId,
            workspaceId: activityStreamData.workspaceId,
            recordId:
              activityStreamData.recordId ?? (record.id as string | null),
            newChanges: record,
          })
        )
      );
    }

    if (this.saveEmbedding) {
      await this.vectorDbService.embedRowsBatch(
        this.schemaTsName,
        createdRows as unknown as RowEmbeddingData[],
        activityStreamData?.workspaceId ?? null
      );
    }

    if (this.sendWebhooks) {
      await Promise.allSettled(
        createdRows.map((record) =>
          this.sendWebhookIfNeeded({
            eventType: ActivityActions.CREATE,
            workspaceId: activityStreamData?.workspaceId ?? '',
            data: record,
          })
        )
      );
    }

    return createdRows;
  }

  public async findManyWithRelations(
    pagination?: DbModelPagination
  ): Promise<DbModelSelectResult<DbModelTable>[]> {
    const data = await this.queryClient.findMany({
      with: this.queryRelations,
      ...pagination,
    });
    return data as DbModelSelectResult<DbModelTable>[];
  }

  public async findWithRelationsByPk(
    pk: string
  ): Promise<DbModelSelectResult<DbModelTable>[]> {
    const data = await this.queryClient.findFirst({
      where: eq(this.dbTablePkColumn, pk),
      with: this.queryRelations,
    });
    return data as DbModelSelectResult<DbModelTable>[];
  }

  public async findMany(opts?: {
    args?: DbModelFindManyArgs<DbModelWhere, DbModelTable>;
    select?: ColumnSelection;
  }): Promise<DbModelSelectResult<DbModelTable>[]> {
    const { args, select } = opts ?? {};
    let selectedColumns = this.dbTable;

    if (select) {
      const transformedColumns = Object.fromEntries(
        Object.keys(select).map((column) => [column, this.dbTable[column]])
      );
      selectedColumns = transformedColumns as DbModelTable;
    }
    let query = this.client
      .select(selectedColumns)
      .from(this.dbTable)
      .$dynamic();

    query = this.defaultSortQuery(query);

    if (args?.where) {
      query = this.filterQuery(query, args.where);
    }
    if (args?.pagination) {
      query = this.paginateQuery(query, args.pagination);
    }
    if (args?.sorting) {
      query = this.sortQuery(query, args.sorting);
    }
    const rows = await query;
    return rows;
  }

  public async count(where?: DbModelWhere): Promise<number> {
    let query = this.client
      .select({
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(this.dbTable)
      .$dynamic();

    if (where) {
      query = this.filterQuery(query, where);
    }

    const [value] = await query;
    if (!value) {
      throw new Error();
    }
    return value.count;
  }

  public async findUniqueByPk(
    pk: string
  ): Promise<DbModelSelectResult<DbModelTable> | null> {
    const rows = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTablePkColumn, pk));

    if (rows.length > 1) {
      throw new Error(
        `Found more than one row with the same primary key ('${pk}') in the '${this.dbTableName}' table`
      );
    }

    return rows[0] || null;
  }

  public async findUniqueByPkAdmin(
    pk: string,
    loadRelations = false
  ): Promise<DbModelSelectResult<DbModelTable> | null> {
    const rows = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTablePkColumn, pk));

    if (rows.length > 1) {
      throw new Error(
        `Found more than one row with the same primary key ('${pk}') in the '${this.dbTableName}' table`
      );
    }

    const row = rows[0];
    if (!row) {
      return null;
    }

    if (loadRelations) {
      const relations = getUniqueRelations(this.manyRelationsMap);
      const relationsData = await this.loadRelationsByAdmin(relations, pk);
      if (relationsData) {
        Object.assign(row, relationsData);
      }
    }
    return row;
  }

  /**
   * Manually triggers an Algolia update by PK.
   */
  public async handleAlgoliaSaveByPk(pk: string): Promise<void> {
    try {
      await this.algoliaModel?.getDataClass()?.updateInAlgolia(pk);
    } catch (error) {
      logger.error(`Error updating Algolia for PK: ${pk}`, error);
    }
  }

  /**
   * Logs an activity record. The actual logic is in `logActivityIfNeeded`.
   */
  public async logActivity({
    pk,
    eventType,
    userId,
    workspaceId,
    recordId,
    newChanges,
    oldChanges,
  }: {
    pk: string | null;
    eventType: ActivityActions;
    userId: string;
    workspaceId?: string | null;
    recordId?: string;
    newChanges: Record<string, unknown>;
    oldChanges?: Record<string, unknown>;
  }): Promise<void> {
    await this.logActivityIfNeeded({
      pk,
      eventType,
      userId,
      newChanges,
      oldChanges,
      workspaceId,
      recordId,
    });
  }

  public async update({
    pk,
    data,
    activityStreamData,
  }: {
    pk: string;
    data: PgUpdateSetSource<DbModelTable>;
    activityStreamData?: ActivityStreamData;
  }): Promise<InferSelectModel<DbModelTable>> {
    const updatedRow = await this.client.transaction(async (trx) => {
      if (activityStreamData) {
        await this.logActivityIfNeeded({
          pk,
          eventType: ActivityActions.UPDATE,
          userId: activityStreamData.userId,
          workspaceId: activityStreamData.workspaceId,
          recordId: activityStreamData.recordId,
          newChanges: data,
        });
      }

      const updated = await this.updateSingleRow(trx, pk, data);

      if (this.saveEmbedding) {
        await this.vectorDbService.embedRowsBatch(
          this.schemaTsName,
          [updated as unknown as RowEmbeddingData],
          activityStreamData?.workspaceId ?? null
        );
      }

      return updated;
    });

    await this.handleAlgoliaSaveIfPossible(updatedRow);

    if (this.sendWebhooks) {
      await this.sendWebhookIfNeeded({
        eventType: ActivityActions.UPDATE,
        workspaceId: activityStreamData?.workspaceId ?? '',
        data: updatedRow,
      });
    }

    return updatedRow;
  }

  public async updateMany({
    pk,
    data,
    activityStreamData,
  }: {
    pk: string[];
    data: PgUpdateSetSource<DbModelTable>;
    activityStreamData?: ActivityStreamData;
  }): Promise<InferSelectModel<DbModelTable>[]> {
    if (!this.dbTablePkColumn) {
      throw new Error(
        `Primary key column is not defined for '${this.dbTableName}' table`
      );
    }

    const updatedRows = await this.client.transaction(async (trx) => {
      if (activityStreamData) {
        await Promise.allSettled(
          pk.map((key) =>
            this.logActivityIfNeeded({
              pk: key,
              eventType: ActivityActions.UPDATE,
              userId: activityStreamData.userId,
              workspaceId: activityStreamData.workspaceId,
              recordId: activityStreamData.recordId,
              newChanges: data,
            })
          )
        );
      }

      const updated = await this.updateMultipleRows(trx, pk, data);

      if (this.saveEmbedding) {
        await Promise.all(
          updated.map((row) =>
            this.vectorDbService.embedRowsBatch(
              this.schemaTsName,
              [row as unknown as RowEmbeddingData],
              activityStreamData?.workspaceId ?? null
            )
          )
        );
      }

      return updated;
    });

    await Promise.all(
      updatedRows.map((row) => this.handleAlgoliaSaveIfPossible(row))
    );

    if (this.sendWebhooks) {
      await Promise.allSettled(
        updatedRows.map((record) =>
          this.sendWebhookIfNeeded({
            eventType: ActivityActions.UPDATE,
            workspaceId: activityStreamData?.workspaceId ?? '',
            data: record,
          })
        )
      );
    }

    return updatedRows;
  }

  public async updateByAdmin<T>({
    pk,
    data,
    activityStreamData,
  }: {
    pk: string;
    data: T;
    activityStreamData?: ActivityStreamData;
  }): Promise<InferSelectModel<DbModelTable>> {
    const updatedRow = await this.client.transaction(async (trx) => {
      const newData = data as PgUpdateSetSource<DbModelTable>;

      if (activityStreamData) {
        await this.logActivityIfNeeded({
          pk,
          eventType: ActivityActions.UPDATE,
          userId: activityStreamData.userId,
          workspaceId: activityStreamData.workspaceId,
          recordId: activityStreamData.recordId,
          newChanges: newData,
        });
      }

      const updated = await this.updateSingleRow(trx, pk, newData);

      if (this.saveEmbedding) {
        await this.vectorDbService.embedRowsBatch(
          this.schemaTsName,
          [updated as unknown as RowEmbeddingData],
          activityStreamData?.workspaceId ?? null
        );
      }

      return updated;
    });

    await this.handleAlgoliaSaveIfPossible(updatedRow);

    if (this.sendWebhooks) {
      await this.sendWebhookIfNeeded({
        eventType: ActivityActions.UPDATE,
        workspaceId: activityStreamData?.workspaceId ?? '',
        data: updatedRow,
      });
    }

    return updatedRow;
  }

  public async delete({
    pk,
    activityStreamData,
  }: {
    pk: string;
    activityStreamData?: ActivityStreamData;
  }): Promise<void> {
    await this.client.transaction(async (tx) => {
      await tx.delete(this.dbTable).where(eq(this.dbTablePkColumn, pk));

      if (this.saveEmbedding) {
        await this.vectorDbService.removeEmbedding(this.schemaTsName, pk);
      }

      if (activityStreamData) {
        await this.logActivityIfNeeded({
          pk,
          eventType: ActivityActions.DELETE,
          userId: activityStreamData.userId,
          workspaceId: activityStreamData.workspaceId,
          recordId: activityStreamData.recordId,
          newChanges: {},
        });
      }
    });

    await this.handleAlgoliaRemoveIfPossible(pk);

    if (this.saveEmbedding) {
      await this.vectorDbService.removeEmbedding(this.schemaTsName, pk);
    }

    if (this.sendWebhooks) {
      await this.sendWebhookIfNeeded({
        eventType: ActivityActions.DELETE,
        workspaceId: activityStreamData?.workspaceId ?? '',
        data: { id: pk },
      });
    }
  }

  public async deleteMany({
    pks,
    activityStreamData,
  }: {
    pks: string[];
    activityStreamData?: ActivityStreamData;
  }): Promise<void> {
    const recordsToDelete = activityStreamData
      ? await this.client
          .select()
          .from(this.dbTable)
          .where(inArray(this.dbTablePkColumn, pks))
      : [];

    await this.client.transaction(async (tx) => {
      if (activityStreamData) {
        await Promise.allSettled(
          recordsToDelete.map((record) =>
            this.logActivityIfNeeded({
              pk: null,
              eventType: ActivityActions.DELETE,
              userId: activityStreamData.userId,
              workspaceId: activityStreamData.workspaceId,
              recordId: activityStreamData.recordId,
              newChanges: {},
              oldChanges: record,
            })
          )
        );
      }

      await tx.delete(this.dbTable).where(inArray(this.dbTablePkColumn, pks));
    });

    await Promise.allSettled(
      pks.map((pk) => this.handleAlgoliaRemoveIfPossible(pk))
    );

    if (this.saveEmbedding) {
      await Promise.allSettled(
        pks.map((pk) =>
          this.vectorDbService.removeEmbedding(this.schemaTsName, pk)
        )
      );
    }

    if (this.sendWebhooks) {
      await Promise.allSettled(
        pks.map((pk) =>
          this.sendWebhookIfNeeded({
            eventType: ActivityActions.DELETE,
            workspaceId: activityStreamData?.workspaceId ?? '',
            data: { id: pk },
          })
        )
      );
    }
  }

  public async deleteByAdmin({
    fieldName,
    value,
    activityStreamData,
  }: {
    fieldName: string;
    value: string;
    activityStreamData?: ActivityStreamData;
  }): Promise<void> {
    await this.client.transaction(async (tx) => {
      await tx
        .delete(this.dbTable)
        .where(eq(this.dbTable[fieldName as keyof DbModelTableColumns], value));

      if (activityStreamData) {
        await this.logActivityIfNeeded({
          pk: value,
          eventType: ActivityActions.DELETE,
          userId: activityStreamData.userId,
          workspaceId: activityStreamData.workspaceId,
          recordId: activityStreamData.recordId,
          newChanges: {},
        });
      }
    });

    await this.handleAlgoliaRemoveIfPossible(value);

    if (this.saveEmbedding) {
      await this.vectorDbService.removeEmbedding(this.schemaTsName, value);
    }

    if (this.sendWebhooks) {
      await this.sendWebhookIfNeeded({
        eventType: ActivityActions.DELETE,
        workspaceId: activityStreamData?.workspaceId ?? '',
        data: { [fieldName]: value },
      });
    }
  }

  public async linkManyToMany(
    mainRecordId: string,
    relatedIds: string[],
    pivotTable: DbModelTable,
    mainKey: keyof (typeof pivotTable)['_']['columns'],
    relatedKey: keyof (typeof pivotTable)['_']['columns']
  ): Promise<void> {
    const insertData = relatedIds.map((relatedId) => ({
      [mainKey]: mainRecordId,
      [relatedKey]: relatedId,
    })) as PgInsertValue<typeof this.dbTable>[];

    await this.client.insert(pivotTable).values(insertData);
  }

  public async updateRelations(
    mainRecordId: string,
    relatedIds: string[],
    mainKey: string,
    relatedKey: string
  ): Promise<void> {
    await this.client
      .delete(this.dbTable)
      .where(eq(this.dbTable[mainKey] as PgColumn, mainRecordId));

    if (relatedIds.length) {
      const insertData = relatedIds.map((relatedId) => ({
        [mainKey]: mainRecordId,
        [relatedKey]: relatedId,
      })) as PgInsertValue<typeof this.dbTable>[];

      await this.client.insert(this.dbTable).values(insertData);
    }
  }
}
