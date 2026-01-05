import baseConfig from '@meltstudio/jest-config/jest-node';
import type { JestConfigWithTsJest } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';

import tsConfig from './tsconfig.json';

const config: JestConfigWithTsJest = {
  ...baseConfig,
  collectCoverageFrom: ['!src/types/**/*.ts', 'src/**/*'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  setupFiles: ['./jest.setup.ts'],
};

export default config;
