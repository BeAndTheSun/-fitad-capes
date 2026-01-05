import nextJest from 'next/jest';

const collectCoverage = process.env.COLLECT_COVERAGE === 'true';

const createJestConfig = (config = {}) => {
  let jestConfig: object = {
    collectCoverage: false,
    coveragePathIgnorePatterns: ['.*snap$', '/node_modules/', '/dist/'],
    testEnvironment: 'jest-environment-jsdom',
    testMatch: [
      '**/tests/*.spec.ts',
      '**/tests/*.spec.tsx',
      '**/tests/**/*.spec.ts',
      '**/tests/**/*.spec.tsx',
    ],
    transform: {
      '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
        'jest-transform-stub',
    },
  };

  if (collectCoverage) {
    jestConfig = {
      ...jestConfig,
      collectCoverage: true,
      collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    };
  }

  jestConfig = {
    ...jestConfig,
    ...config,
  };

  return nextJest({ dir: './' })(jestConfig);
};

export default createJestConfig;
