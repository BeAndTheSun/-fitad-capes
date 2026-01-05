import jestConfig from '@meltstudio/jest-config/jest-node';
import { pathsToModuleNameMapper } from 'ts-jest';

import tsConfig from './tsconfig.json';

const config = {
  ...jestConfig,
  moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  modulePaths: ['<rootDir>'],
  setupFiles: ['<rootDir>jest.setup.js'],
};

export default config;
