import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
  KnownKeysOnly,
} from 'drizzle-orm';
import type { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import type * as schema from '@/db/schema';

type Schema = typeof schema;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
  'one' | 'many',
  boolean,
  TSchema,
  TSchema[TableName]
>['with'];

export type InferResultType<
  TableName extends keyof TSchema,
  With extends IncludeRelation<TableName> | undefined = undefined,
> = BuildQueryResult<
  TSchema,
  TSchema[TableName],
  {
    with: With;
  }
>;

export type DbClientType = PostgresJsDatabase<Schema>;

export type SchemaWithRelations = ExtractTablesWithRelations<typeof schema>;
export type SchemaAccessibleName = keyof SchemaWithRelations;

export type GenericDbQueryClient<T extends SchemaAccessibleName> =
  RelationalQueryBuilder<SchemaWithRelations, SchemaWithRelations[T]>;

export type FindManyArgs<T extends SchemaAccessibleName> = Parameters<
  GenericDbQueryClient<T>['findMany']
>['0'];
export type FindFirstArgs<T extends SchemaAccessibleName> = Parameters<
  GenericDbQueryClient<T>['findFirst']
>['0'];

type RelationsConfig<T extends SchemaAccessibleName> = DBQueryConfig<
  'many',
  true,
  SchemaWithRelations,
  SchemaWithRelations[T]
>;

export type GetQueryRelations<T extends SchemaAccessibleName> = KnownKeysOnly<
  RelationsConfig<T>,
  DBQueryConfig<'many', true, SchemaWithRelations, SchemaWithRelations[T]>
>['with'];

export type GetQueryWhere<T extends SchemaAccessibleName> = KnownKeysOnly<
  RelationsConfig<T>,
  DBQueryConfig<'many', true, SchemaWithRelations, SchemaWithRelations[T]>
>['where'];
