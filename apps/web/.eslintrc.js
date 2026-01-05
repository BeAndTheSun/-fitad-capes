module.exports = {
  root: true,
  extends: [
    '@meltstudio/eslint-config/nextjs-ts',
    '@meltstudio/eslint-config/jest-react-overrides',
    'plugin:tailwindcss/recommended',
    'plugin:i18next/recommended',
  ],
  plugins: ['unused-imports'],
  rules: {
    'i18next/no-literal-string': 'off',
    // Allow the return keyword in else blocks to a easy code remove for the scripts
    'no-else-return': 'off',
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
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
    ],
  },
  settings: {
    tailwindcss: {
      config: require('./tailwind.config.js'),
    },
  },
};
