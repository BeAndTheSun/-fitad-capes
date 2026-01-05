module.exports = {
  root: true,
  extends: [
    '@meltstudio/eslint-config/react-ts',
    '@meltstudio/eslint-config/jest-react-overrides',
    'plugin:tailwindcss/recommended',
  ],
  ignorePatterns: ['node_modules', 'dist'],
  settings: {
    tailwindcss: {
      config: require('./tailwind.config.js'),
    },
  },
  plugins: ['unused-imports'],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
