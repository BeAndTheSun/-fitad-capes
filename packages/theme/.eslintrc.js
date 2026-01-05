module.exports = {
  root: true,
  extends: [
    '@meltstudio/eslint-config/react-ts',
    '@meltstudio/eslint-config/jest-overrides',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    'jsx-a11y/heading-has-content': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/no-unknown-property': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'func-names': 'off',
    'consistent-return': 'off',
    'default-case': 'off',
  },
  settings: {
    tailwindcss: {
      config: require('./tailwind.config.js'),
    },
  },
};
