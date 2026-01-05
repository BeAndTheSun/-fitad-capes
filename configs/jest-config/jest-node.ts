import type { JestConfigWithTsJest } from 'ts-jest';

const collectCoverage = process.env.COLLECT_COVERAGE === 'true';

let config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  collectCoverage: false,
  coveragePathIgnorePatterns: ['.*snap$', '/node_modules/', '/dist/'],
  testEnvironment: 'node',
  testMatch: ['**/tests/*.spec.ts', '**/tests/**/*.spec.ts'],
};

if (collectCoverage) {
  config = {
    ...config,
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  };
}

export default config;
