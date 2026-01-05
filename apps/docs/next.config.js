const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  latex: true,
  flexsearch: {
    codeblock: false,
  },
});

module.exports = withNextra({
  reactStrictMode: true,
});
