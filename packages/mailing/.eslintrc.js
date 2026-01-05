module.exports = {
  root: true,
  extends: [
    '@meltstudio/eslint-config/node-ts',
    '@meltstudio/eslint-config/jest-react-overrides',
    'plugin:tailwindcss/recommended',
  ],
  overrides: [
    {
      files: ['src/emails/*.tsx', 'src/index.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
  settings: {
    tailwindcss: {
      config: require('./tailwind.config.js'),
    },
  },
};
