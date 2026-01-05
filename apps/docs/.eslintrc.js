module.exports = {
  root: true,
  extends: [
    '@meltstudio/eslint-config/nextjs-ts',
    '@meltstudio/eslint-config/jest-react-overrides',
    'plugin:tailwindcss/recommended',
    'plugin:i18next/recommended',
    'plugin:mdx/recommended',
  ],
  settings: {
    tailwindcss: {
      config: require('./tailwind.config.js'),
    },
  },
};
