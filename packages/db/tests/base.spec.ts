/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/unbound-method */
import { AlgoliaClient } from '@meltstudio/algolia-client';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import type {
  AlgoliaObjectConfig,
  IncludeRelationDef,
  NotifyRelationDef,
} from '@/db/algolia/model/base';
import {
  AlgoliaDataConfigCl,
  algoliaModel,
  AlgoliaModelDef,
  snakeToCamel,
} from '@/db/algolia/model/base';
import { DbClient } from '@/db/models/client';

jest.mock('@meltstudio/algolia-client');
jest.mock('@/db/models/base');
jest.mock('@/db/models/client');

describe('AlgoliaModelDef', () => {
  let table: PgTable;
  let pkColumn: PgColumn;
  let config: AlgoliaObjectConfig<unknown>;
  let includeRelations: Record<string, IncludeRelationDef>;
  let notifyRelations: Record<string, NotifyRelationDef>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let algoliaModelDef: AlgoliaModelDef<any>;

  beforeEach(() => {
    table = {} as PgTable;
    pkColumn = {} as PgColumn;
    config = {};
    includeRelations = {};
    notifyRelations = {};

    (AlgoliaClient.createAlgoliaClient as jest.Mock).mockReturnValue({
      saveObject: jest.fn(),
      saveObjects: jest.fn(),
      deleteObject: jest.fn(),
      setSettings: jest.fn(),
    });

    (DbClient.getClient as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue([]),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      $dynamic: jest.fn().mockReturnThis(),
    });

    algoliaModelDef = new AlgoliaModelDef(
      table,
      pkColumn,
      config,
      includeRelations,
      notifyRelations
    );
  });

  it('should generate sort fields correctly', () => {
    const sortConfig = {
      field1: { canSort: true },
      field2: { nestedField: { canSort: true } },
    };

    const sortFields = algoliaModelDef.generateSortFields(sortConfig);

    expect(sortFields).toEqual([
      { field: 'field1', replicaName: 'field1' },
      { field: 'field2.nestedField', replicaName: 'field2_nestedField' },
    ]);
  });

  it('should generate filter fields correctly', () => {
    const filterConfig = {
      field1: { canFilter: true },
      field2: { nestedField: { canFilter: true } },
    };

    const filterFields = algoliaModelDef.generateFilterFields(filterConfig);

    expect(filterFields).toEqual([
      'searchable(field1)',
      'searchable(field2.nestedField)',
    ]);
  });

  it('should filter object by base config correctly', () => {
    Object.assign(algoliaModelDef.baseConfig, {
      field1: true,
      field2: false,
    });

    const data = {
      field1: 'value1',
      field2: 'value2',
    };

    const filteredData = algoliaModelDef['filterObjectByBaseConfig'](data);

    expect(filteredData).toEqual({
      field1: 'value1',
    });
  });

  it('should get data from database correctly', async () => {
    const id = '1';
    const row = {};
    (algoliaModelDef['db'].execute as jest.Mock).mockResolvedValue([row]);

    const result = (await algoliaModelDef.getFromDb(id)) as Record<
      string,
      unknown
    >;

    expect(result).toEqual(row);
    expect(algoliaModelDef['db'].select).toHaveBeenCalled();
  });

  it('should get many data from database correctly', async () => {
    const rows = [{}, {}];
    (algoliaModelDef['db'].execute as jest.Mock).mockResolvedValue(rows);

    const result = await algoliaModelDef.getManyFromDb();

    expect(result).toEqual(rows);
    expect(algoliaModelDef['db'].select).toHaveBeenCalled();
  });

  it('should update data in Algolia correctly', async () => {
    const pk = '1';
    const data = { field1: 'value1' };
    jest.spyOn(algoliaModelDef, 'getWithRelations').mockResolvedValue(data);

    await algoliaModelDef.updateInAlgolia(pk);

    expect(algoliaModelDef['client'].saveObject).toHaveBeenCalledWith({
      indexName: algoliaModelDef['indexName'],
      body: {
        objectID: pk,
        ...data,
      },
    });
  });

  it('should delete data from Algolia correctly', async () => {
    const pk = '1';

    await algoliaModelDef.deleteFromAlgolia(pk);

    expect(algoliaModelDef['client'].deleteObject).toHaveBeenCalledWith({
      indexName: algoliaModelDef['indexName'],
      objectID: pk,
    });
  });

  it('should sync index correctly', async () => {
    jest.spyOn(algoliaModelDef, 'generateSortFields').mockReturnValue([]);
    jest.spyOn(algoliaModelDef, 'generateFilterFields').mockReturnValue([]);

    await algoliaModelDef.syncIndex();

    expect(algoliaModelDef['client'].setSettings).toHaveBeenCalled();
  });
});

describe('AlgoliaDataConfigCl', () => {
  let table: PgTable;
  let pkColumn: PgColumn;
  let config: AlgoliaObjectConfig<unknown>;
  let includeRelations: Record<string, IncludeRelationDef>;
  let notifyRelations: Record<string, NotifyRelationDef>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let algoliaDataConfigCl: AlgoliaDataConfigCl<any>;

  beforeEach(() => {
    table = {} as PgTable;
    pkColumn = {} as PgColumn;
    config = {};
    includeRelations = {};
    notifyRelations = {};

    algoliaDataConfigCl = new AlgoliaDataConfigCl(
      table,
      pkColumn,
      config,
      includeRelations,
      notifyRelations
    );
  });

  it('should create AlgoliaModelDef instance correctly', () => {
    const dataClass = algoliaDataConfigCl.getDataClass();

    expect(dataClass).toBeInstanceOf(AlgoliaModelDef);
    expect(dataClass['table']).toBe(table);
    expect(dataClass.pkColumn).toBe(pkColumn);
    expect(dataClass.config).toStrictEqual(config);
    expect(dataClass.includeRelations).toBe(includeRelations);
    expect(dataClass.notifyRelations).toBe(notifyRelations);
  });
});

describe('algoliaModel', () => {
  it('should create AlgoliaDataConfigCl instance correctly', () => {
    const table = {} as PgTable;
    const pkColumn = {} as PgColumn;
    const config = {};
    const includeRelations = {};
    const notifyRelations = {};

    const result = algoliaModel({
      table,
      pkColumn,
      config,
      includeRelations,
      notifyRelations,
    });

    expect(result).toBeInstanceOf(AlgoliaDataConfigCl);
    expect(result['table']).toBe(table);
    expect(result.pkColumn).toBe(pkColumn);
    expect(result.config).toStrictEqual(config);
    expect(result.includeRelations).toBe(includeRelations);
    expect(result.notifyRelations).toBe(notifyRelations);
  });
});

describe('snakeToCamel', () => {
  it('should convert a simple snake_case string to camelCase', () => {
    expect(snakeToCamel('example_string')).toBe('exampleString');
  });

  it('should handle multiple underscores correctly', () => {
    expect(snakeToCamel('this_is_a_test')).toBe('thisIsATest');
  });

  it('should ignore trailing underscores', () => {
    expect(snakeToCamel('trailing_underscore_')).toBe('trailingUnderscore');
  });

  it('should return the same string if there are no underscores', () => {
    expect(snakeToCamel('NoUnderscores')).toBe('NoUnderscores');
  });

  it('should return an empty string when given an empty string', () => {
    expect(snakeToCamel('')).toBe('');
  });

  it('should handle single word without underscores', () => {
    expect(snakeToCamel('word')).toBe('word');
  });

  it('should handle consecutive underscores', () => {
    expect(snakeToCamel('this__is__a__test')).toBe('thisIsATest');
  });
});
