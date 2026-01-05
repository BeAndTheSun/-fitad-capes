import { JestConfigWithTsJest } from 'ts-jest';

const collectCoverage = process.env.COLLECT_COVERAGE === 'true';

let config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  collectCoverage: false,
  coveragePathIgnorePatterns: ['.*snap$', '/node_modules/', '/dist/'],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  transform: {
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/*.spec.{ts,tsx}', '**/tests/**/*.spec.{ts,tsx}'],
};

if (collectCoverage) {
  config = {
    ...config,
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  };
}

export default config;
