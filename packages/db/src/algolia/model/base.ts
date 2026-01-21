/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
import type { AlgoliaClientInstance } from '@meltstudio/algolia-client';
import { AlgoliaClient } from '@meltstudio/algolia-client';
import type { AlgoliaIndex } from '@meltstudio/types';
import { eq, getTableName, inArray } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DbClient } from '@/db/models/client';
import type * as schema from '@/db/schema';

type AlgoliaDataConfig = {
  canSort?: boolean;
  canFilter?: boolean;
};

type SortFieldConfig = {
  field: string;
  replicaName: string;
};

type IsArray<T> = T extends Array<unknown> ? true : false;

// Recursive DataType: Handles objects and applies config to arrays' object properties
export type AlgoliaObjectConfig<T> = {
  [K in keyof T]?: IsArray<T[K]> extends true
    ? T[K] extends Array<infer U>
      ? AlgoliaObjectConfig<U> | boolean
      : never
    : T[K] extends object
      ? AlgoliaObjectConfig<T[K]> | boolean
      : AlgoliaDataConfig | boolean;
};

// Define keys mapping type
type ManyKeyMap = {
  foreignKey: PgColumn; // Foreign key in source table
  referenceKey: PgColumn; // Key in target table
};

type OneKeyMap = {
  foreignKey: PgColumn; // Foreign key in source table
};

export type NotifyRelationDef<U extends PgTable = PgTable> =
  | {
      type: 'one';
      targetTable?: PgTable;
      model: AlgoliaDataConfigCl<U>;
      index: AlgoliaIndex;
      keys: OneKeyMap;
    }
  | {
      type: 'many';
      targetTable?: PgTable;
      model: AlgoliaDataConfigCl<U>;
      index: AlgoliaIndex;
      keys: ManyKeyMap;
    };

export type IncludeRelationDef<
  U extends PgTable = PgTable,
  R extends PgTable = PgTable,
> =
  | {
      type: 'one';
      targetTable?: PgTable;
      model: AlgoliaDataConfigCl<U>;
      index: AlgoliaIndex;
      keys: OneKeyMap;
      includeRelationData?: AlgoliaObjectConfig<R['$inferSelect']>;
    }
  | {
      type: 'many';
      targetTable?: PgTable;
      model: AlgoliaDataConfigCl<U>;
      index: AlgoliaIndex;
      keys: ManyKeyMap;
      includeRelationData?: AlgoliaObjectConfig<R['$inferSelect']>;
    };

export function snakeToCamel(snake: string): string {
  return snake
    .replace(/^_+|_+$/g, '')
    .replace(/__+/g, '_')
    .replace(/(_\w)/g, (matches) =>
      matches[1] ? matches[1].toUpperCase() : ''
    );
}

export class AlgoliaModelDef<T extends PgTable> {
  public readonly baseConfig: AlgoliaObjectConfig<T['$inferSelect']>;

  public readonly config: AlgoliaObjectConfig<T['$inferSelect']>;

  public readonly pkColumn: PgColumn;

  public includeRelations: Record<string, IncludeRelationDef> = {};

  public notifyRelations: Record<string, NotifyRelationDef> = {};

  protected table: PgTable;

  protected client: AlgoliaClientInstance;

  protected db: PostgresJsDatabase<typeof schema>;

  public constructor(
    table: PgTable,
    pkColumn: PgColumn,
    config: AlgoliaObjectConfig<T['$inferSelect']>,
    includeRelations?: Record<string, IncludeRelationDef>,
    notifyRelations?: Record<string, NotifyRelationDef>
  ) {
    this.table = table;
    this.pkColumn = pkColumn;
    this.baseConfig = config;
    this.config = config;
    this.includeRelations = includeRelations || {};
    this.notifyRelations = notifyRelations || {};

    this.client = AlgoliaClient.createAlgoliaClient();
    this.db = DbClient.getClient();

    if (includeRelations) {
      const mappedConfig = Object.entries(includeRelations).reduce(
        (acc, [key, relation]) => {
          const relationConfig = relation.model.config;
          return {
            ...acc,
            [key]: relationConfig,
          };
        },
        {}
      );

      this.config = {
        ...config,
        ...mappedConfig,
      };
    }
  }

  protected get indexName(): string {
    return getTableName(this.table);
  }

  public generateSortFields<G extends Record<string, unknown>>(
    config: G,
    parentKey: string = ''
  ): SortFieldConfig[] {
    const sortFields: SortFieldConfig[] = [];

    if (!config || Object.keys(config).length === 0) {
      return sortFields;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(config)) {
      const currentField = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        const { canSort, ...nestedValue } = value as Record<string, unknown>;

        if (canSort) {
          sortFields.push({
            field: currentField, // Field uses dot notation
            replicaName: currentField.replaceAll('.', '_'), // Replica name uses underscores
          });
        }

        if (Object.keys(nestedValue).length > 0) {
          sortFields.push(
            ...this.generateSortFields(nestedValue as G, currentField)
          );
        }
      }
    }

    return sortFields;
  }

  public generateFilterFields<G extends Record<string, unknown>>(
    config: G,
    parentKey: string = ''
  ): string[] {
    const filterFields: string[] = [];

    if (!config || Object.keys(config).length === 0) {
      return filterFields;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(config)) {
      const currentField = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        const { canFilter, ...nestedValue } = value as Record<string, unknown>;

        if (canFilter) {
          filterFields.push(`searchable(${currentField})`);
        }

        if (Object.keys(nestedValue).length > 0) {
          filterFields.push(
            ...this.generateFilterFields(nestedValue as G, currentField)
          );
        }
      }
    }

    return filterFields;
  }

  private filterObjectByBaseConfig(
    data: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.entries(this.baseConfig).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (value === false) {
          return acc; // Exclude the field
        }

        // Include the field, and convert `undefined` values to `null`
        acc[key] = data[key] !== undefined ? data[key] : null;
        return acc;
      },
      {}
    );
  }

  public async getFromDb(id: string): Promise<T['$inferSelect'] | null> {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.pkColumn, id))
      .execute();

    return row ? this.filterObjectByBaseConfig(row as T['$inferSelect']) : null;
  }

  public async getManyFromDb(args?: {
    ids?: string[];
    pagination?: { offset: number; limit: number };
  }): Promise<T['$inferSelect'][]> {
    const { ids, pagination } = args || {};

    let query = this.db.select().from(this.table).$dynamic();

    if (ids) {
      query = query.where(inArray(this.pkColumn, ids));
    }

    if (pagination) {
      query = query.offset(pagination.offset).limit(pagination.limit);
    }

    const rows: T['$inferSelect'][] = await query.execute();

    return rows.map((row) => this.filterObjectByBaseConfig(row));
  }

  public async getWithRelations(id: string): Promise<T['$inferSelect'] | null> {
    const data = (await this.getFromDb(id)) as unknown as Record<
      string,
      unknown
    >;

    if (!data) return null;

    const promises: Promise<void>[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [name, relation] of Object.entries(this.includeRelations)) {
      const { type, model, keys, targetTable } = relation || {};

      // One to many | one to one
      if (type === 'one') {
        promises.push(
          model
            .getDataClass()
            .getFromDb(data[snakeToCamel(keys.foreignKey.name)] as string)
            .then((relatedData) => {
              data[name] = relatedData;
            })
            .catch(() => {
              data[name] = null;
            })
        );
      }

      // Many to many
      if (type === 'many' && targetTable) {
        promises.push(
          this.db
            .select()
            .from(targetTable)
            .where(eq(keys.foreignKey, id))
            .execute()
            .then((relationData) => {
              const relatedIds: string[] = relationData.map((item) => {
                const colName = snakeToCamel(keys.referenceKey.name);
                return item[colName] as string;
              });
              return model
                .getDataClass()
                .getManyFromDb({ ids: relatedIds })
                .then((relatedData) => {
                  const allData = relatedData.map((r) => {
                    const restData = relationData.find(
                      (rd) => rd[snakeToCamel(keys.referenceKey.name)] === r.id
                    );
                    return {
                      ...r,
                      ...restData,
                    };
                  });
                  data[name] = allData;
                });
            })
            .catch(() => {
              data[name] = [];
            })
        );
      }
    }

    await Promise.all(promises);
    return data;
  }

  protected async updateRelationsForPk(pk: string): Promise<void> {
    // Relations
    // eslint-disable-next-line no-restricted-syntax
    for (const [, relation] of Object.entries(this.notifyRelations)) {
      const { type, keys, model, targetTable } = relation;

      if (!targetTable) return;

      if (type === 'one') {
        const [row] = await this.db
          .select()
          .from(this.table)
          .where(eq(this.pkColumn, pk));

        if (!row) return;

        const accessibleName = snakeToCamel(keys.foreignKey.name);
        const idToUpdate = row[accessibleName] as string;

        await model.getDataClass().updateInAlgolia(idToUpdate);
      }

      if (type === 'many') {
        const rows = await this.db
          .select()
          .from(targetTable)
          .where(eq(keys.foreignKey, pk));

        const idsToUpdate = rows.map(
          (r) => r[snakeToCamel(keys.referenceKey.name)] as string
        );

        await Promise.all(
          idsToUpdate.map((id) => model.getDataClass().updateInAlgolia(id))
        );
      }
    }
  }

  public async updateInAlgolia(pk: string): Promise<void> {
    const data = await this.getWithRelations(pk);
    if (!data) return;

    await this.client.saveObject({
      indexName: this.indexName,
      body: {
        objectID: pk,
        ...data,
      },
    });

    await this.updateRelationsForPk(pk);
  }

  public async updateManyInAlgolia(
    data: Array<{ objectID: string; row: Partial<T> }>
  ): Promise<void> {
    const { client } = this;

    const filteredDataPromises = data.map(async ({ objectID }) => {
      const dataRow = await this.getWithRelations(objectID);

      if (!dataRow) return null;

      return {
        objectID,
        ...dataRow,
      };
    });

    const filteredData = (await Promise.all(filteredDataPromises)).filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    // Update Algolia objects
    await client.saveObjects({
      indexName: this.indexName,
      objects: filteredData,
    });
  }

  public async deleteFromAlgolia(pk: string): Promise<void> {
    const { client } = this;

    // Delete Algolia object
    await client.deleteObject({
      indexName: this.indexName,
      objectID: pk,
    });
  }

  // Algolia-sync
  // Helper function to set custom ranking for each replica
  private async setRanking(
    replicaName: string,
    order: 'asc' | 'desc',
    field: string
  ): Promise<void> {
    const rankingField = `${order}(${field})`;

    await this.client.setSettings({
      indexName: replicaName,
      indexSettings: {
        customRanking: [rankingField],
      },
    });
  }

  // Algolia-sync
  public async syncIndex(): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const sorting = this.generateSortFields(this.config);
    const filters = this.generateFilterFields(this.config);

    // Generate replica names for both ascending and descending order
    const replicas = sorting.flatMap((m) => [
      `virtual(${this.indexName}_${m.replicaName}_asc)`,
      `virtual(${this.indexName}_${m.replicaName}_desc)`,
    ]);

    await this.client.setSettings({
      indexName: this.indexName,
      indexSettings: {
        replicas,
        attributesForFaceting: filters,
      },
    });

    const rankingPromises = sorting.flatMap((m) => {
      const ascReplicaName = `${this.indexName}_${m.replicaName}_asc`;
      const descReplicaName = `${this.indexName}_${m.replicaName}_desc`;
      return [
        this.setRanking(ascReplicaName, 'asc', m.field),
        this.setRanking(descReplicaName, 'desc', m.field),
      ];
    });

    await Promise.all(rankingPromises);
  }
}

export class AlgoliaDataConfigCl<T extends PgTable = PgTable> {
  public readonly baseConfig: AlgoliaObjectConfig<T['$inferSelect']>;

  public readonly config: AlgoliaObjectConfig<T['$inferSelect']>;

  public readonly pkColumn: PgColumn;

  public includeRelations: Record<string, IncludeRelationDef> = {};

  public notifyRelations: Record<string, NotifyRelationDef> = {};

  protected table: PgTable;

  public constructor(
    table: PgTable,
    pkColumn: PgColumn,
    config: AlgoliaObjectConfig<T['$inferSelect']>,
    includeRelations?: Record<string, IncludeRelationDef>,
    notifyRelations?: Record<string, NotifyRelationDef>
  ) {
    this.table = table;
    this.pkColumn = pkColumn;
    this.baseConfig = config;
    this.config = config;
    this.includeRelations = includeRelations || {};
    this.notifyRelations = notifyRelations || {};

    if (includeRelations) {
      const mappedConfig = Object.entries(includeRelations).reduce(
        (acc, [key, relation]) => {
          const relationConfig = relation.model.config;
          const includeRelation = relation.includeRelationData;
          if (includeRelation) {
            return {
              ...acc,
              [key]: {
                ...relationConfig,
                ...includeRelation,
              },
            };
          }
          return {
            ...acc,
            [key]: relationConfig,
          };
        },
        {}
      );

      this.config = {
        ...config,
        ...mappedConfig,
      };
    }
  }

  public getDataClass(): AlgoliaModelDef<T> {
    return new AlgoliaModelDef(
      this.table,
      this.pkColumn,
      this.config,
      this.includeRelations,
      this.notifyRelations
    );
  }
}

export function algoliaModel<T extends PgTable>(args: {
  table: T;
  pkColumn: PgColumn;
  config: AlgoliaObjectConfig<T['$inferSelect']>;
  includeRelations?: Record<string, IncludeRelationDef>;
  notifyRelations?: Record<string, NotifyRelationDef>;
}): AlgoliaDataConfigCl<T> {
  const { table, pkColumn, config, includeRelations, notifyRelations } = args;

  return new AlgoliaDataConfigCl(
    table,
    pkColumn,
    config,
    includeRelations,
    notifyRelations
  );
}
