var path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
  defaultNS: 'translation',
  localePath: path.resolve('./src/locales'),
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
};
