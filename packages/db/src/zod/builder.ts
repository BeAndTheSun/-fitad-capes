import type { Simplify, Table } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';
import { createSchemaFactory } from 'drizzle-zod';
import type {
  BuildRefine,
  NoUnknownKeys,
} from 'drizzle-zod/schema.types.internal';
import { z } from 'zod';

type TableColumnName<TTable extends Table> = Extract<
  keyof TTable['_']['columns'],
  string
>;

type BuildSortingSchema<TTable extends Table> = Simplify<{
  column: z.ZodEffects<z.ZodString, TableColumnName<TTable>, string>;
  order: z.ZodEnum<['asc', 'desc']>;
}>;

function createSortingSchema<TTable extends Table>(
  table: TTable
): z.ZodObject<BuildSortingSchema<TTable>> {
  const columns = Object.keys(getTableColumns(table));
  const regExp = new RegExp(`${columns.join('|')}`);

  return z.object({
    column: z
      .string()
      .refine((v): v is TableColumnName<TTable> => regExp.test(String(v))),
    order: z.enum(['asc', 'desc']),
  });
}

type RefineParameter<
  TTable extends Table,
  TRefine extends BuildRefine<TTable['_']['columns']>,
> = NoUnknownKeys<TRefine, TTable['$inferSelect']>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export function createSchemasForTable<TTable extends Table>(
  table: TTable,
  overrides?: {
    insert?: RefineParameter<TTable, BuildRefine<TTable['_']['columns']>>;
    select?: RefineParameter<TTable, BuildRefine<TTable['_']['columns']>>;
  }
) {
  const factory = createSchemaFactory();

  return {
    insert: factory.createInsertSchema(table, overrides?.insert),
    select: factory.createSelectSchema(table, overrides?.select),
    sorting: createSortingSchema(table),
  };
}
