import type { PluginPaths } from '@/types';

// Define paths to remove for each plugin
const pluginPathsRemove: PluginPaths = {
  apps: {},
  packages: {
    'feature-flags': [
      'apps/web/src/components/feature-flags',
      'apps/web/src/pages/settings/feature-flags.tsx',
    ],
    'algolia-client': [
      'packages/db/src/algolia/model',
      'packages/db/algolia',
      'packages/db/tests/base.spec.ts',
      'packages/types/src/algolia.ts',
      'packages/ui/src/algolia-table',
      'apps/web/src/components/algolia-table.tsx',
    ],
    i18Next: [
      'apps/web/types/next-i18next-config.d.ts',
      'apps/web/next-i18next.config.js',
      'apps/web/i18next-parser.config.js',
      'apps/web/src/locales',
      'packages/ui/src/language-toggle.tsx',
      'apps/mobile/src/locales',
      'apps/mobile/i18next-parser.config.js',
      'apps/mobile/next-i18next.config.js',
    ],
  },
};

export default pluginPathsRemove;
export type { PluginPaths };
