var path = require('path');

const i8nConfig = {
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

module.exports = i8nConfig;
