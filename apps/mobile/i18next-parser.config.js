module.exports = {
  i18n: {
    keySeparator: false,
    locales: ['en', 'es'],
    defaultLocale: 'en',
    namespaceSeparator: '::',
    output: 'src/locales/$LOCALE/$NAMESPACE.json',
    createOldCatalogs: false,
    failOnWarnings: true,
  },
};
