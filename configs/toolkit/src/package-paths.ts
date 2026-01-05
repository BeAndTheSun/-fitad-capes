import type { PackagePath } from './types';

const packagePaths: PackagePath = {
  '@meltstudio/algolia-client': [
    'packages/db/src/models/base.ts',
    'packages/db/src/config.ts',
    'packages/api/src/utils/session.ts',
    'apps/web/src/config/super-admin.tsx',
    'packages/db/src/models/db.ts',
    'packages/api/src/routers/users/index.ts',
    'packages/types/src/index.ts',
    'packages/ui/src/index.ts',
    'apps/web/src/hooks/use-model-by-route.ts',
    'apps/web/src/pages/super-admin/[model]/index.tsx',
  ],
  '@meltstudio/feature-flags': ['apps/web/src/layouts/settings-layout.tsx'],
  i18Next: [
    'apps/web/next.config.js',
    'apps/web/src',
    'packages/ui/src',
    'apps/web/tests/pages',
    'apps/mobile/src',
  ],
};

export default packagePaths;
