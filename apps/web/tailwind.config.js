const theme = require('@meltstudio/theme/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
const config = {
  ...theme,
  content: ['./src/**/*.tsx', '../../packages/**/*.tsx'],
};

module.exports = config;
