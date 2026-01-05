import { useConfig } from 'nextra-theme-docs';

/* eslint sort-keys: error */
/**
 * @type {import('nextra-theme-docs').DocsThemeConfig}
 */
export default {
  project: {
    link: 'https://github.com/MeltStudio/melt-template-turborepo',
  },
  docsRepositoryBase:
    'https://github.com/MeltStudio/melt-template-turborepo/tree/main/apps/docs',
  banner: {
    key: 'Starter Kit',
    text: 'Starter Kit',
  },
  logo: 'Starter Kit',
  faviconGlyph: '✦',
  useNextSeoProps() {
    const { frontMatter } = useConfig();
    return {
      description: frontMatter.description || 'Starter Kit',
      openGraph: {
        images: [{ url: frontMatter.image || '' }],
      },
      titleTemplate: '%s – Starter Kit',
    };
  },
};
