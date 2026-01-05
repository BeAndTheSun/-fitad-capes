import jestConfig from '@meltstudio/jest-config/jest-node';
import type { JestConfigWithTsJest } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';

import tsConfig from './tsconfig.json';

const config: JestConfigWithTsJest = {
  ...jestConfig,
  moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  modulePaths: ['<rootDir>'],
};

export default config;
