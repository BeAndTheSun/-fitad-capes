const path = require('path');
const { withSentryConfig } = require('@sentry/nextjs');
const withPlugins = require('next-compose-plugins');
const { i18n } = require('./next-i18next.config');

const rewrites = {
  async rewrites() {
    return [];
  },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: !!process.env.CI,
  },
  typescript: {
    ignoreBuildErrors: !!process.env.CI,
    tsconfigPath: 'tsconfig.build.json',
  },
  transpilePackages: [
    '@meltstudio/auth',
    '@meltstudio/db',
    '@meltstudio/mailing',
    '@meltstudio/theme',
    '@meltstudio/api',
    '@meltstudio/ui',
    '@meltstudio/feature-flags',
  ],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          // fixes proxy-agent dependencies
          net: false,
          fs: false,
          tls: false,
          perf_hooks: false,
        },
      };
    }
    return config;
  },
  i18n,
};

// Sentry setup
const {
  VERCEL,
  VERCEL_GIT_COMMIT_REF,
  SENTRY_WEBPACK_PLUGIN,
  SENTRY_AUTH_TOKEN,
  SENTRY_ORG,
  SENTRY_PROJECT,
} = process.env;
const SENTRY_ALLOWED_BRANCHES = ['main'];
function isSentryPluginEnabled() {
  // if the SENTRY_WEBPACK_PLUGIN variable is set to true, enable the plugin
  if (SENTRY_WEBPACK_PLUGIN === 'true') {
    console.log(
      `Enabling Sentry webpack plugin (SENTRY_WEBPACK_PLUGIN=${SENTRY_WEBPACK_PLUGIN})`
    );
    return true;
  }

  // if the build is being done in vercel and the environment is production,
  // enable sourcemaps
  if (
    VERCEL === '1' &&
    SENTRY_ALLOWED_BRANCHES.includes(VERCEL_GIT_COMMIT_REF) &&
    SENTRY_WEBPACK_PLUGIN !== 'false'
  ) {
    console.log(
      `Enabling Sentry webpack plugin (VERCEL=${VERCEL} - VERCEL_GIT_COMMIT_REF=${VERCEL_GIT_COMMIT_REF})`
    );
    return true;
  }

  console.log('Disabling Sentry webpack plugin');
  return false;
}

const sentryPluginEnabled = isSentryPluginEnabled();
if (sentryPluginEnabled) {
  const missing = [];
  if (SENTRY_AUTH_TOKEN == null) {
    missing.push('SENTRY_AUTH_TOKEN');
  }
  if (SENTRY_ORG == null) {
    missing.push('SENTRY_ORG');
  }
  if (SENTRY_PROJECT == null) {
    missing.push('SENTRY_PROJECT');
  }

  if (missing.length > 0) {
    throw new Error(
      `Sentry plugin is enabled but the following environment variables are missing: ${missing.join(
        ', '
      )}`
    );
  }
}

const moduleExports = withPlugins([rewrites], nextConfig);

module.exports = withSentryConfig(
  moduleExports,
  {
    silent: false,
    authToken: SENTRY_AUTH_TOKEN,
    org: SENTRY_ORG,
    project: SENTRY_PROJECT,
  },
  {
    disableClientWebpackPlugin: !sentryPluginEnabled,
    disableServerWebpackPlugin: !sentryPluginEnabled,
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
