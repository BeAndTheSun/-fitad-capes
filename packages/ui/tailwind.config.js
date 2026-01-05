const theme = require('@meltstudio/theme/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
const config = {
  ...theme,
  content: ['./src/**/*.tsx'],
  // presets: [theme],
};

module.exports = config;
