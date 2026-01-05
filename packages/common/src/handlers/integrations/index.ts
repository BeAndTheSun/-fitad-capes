import { db } from '@meltstudio/common/src/db';
import type {
  ActivityActions,
  IntegrationConfig,
  IntegrationsKeys,
} from '@meltstudio/types';
import * as Sentry from '@sentry/node';

import ZapierIntegration from './zapier';

const INTEGRATIONS = [ZapierIntegration];

const IntegrationHooks = {
  async onAddUser(
    user: { email: string; role: string },
    workspaceId: string,
    eventType: ActivityActions
  ): Promise<void> {
    const results = await Promise.allSettled(
      INTEGRATIONS.map(async (IntegrationClass) => {
        const config = await IntegrationHooks.loadConfig(
          workspaceId,
          IntegrationClass.slug
        );
        if (config && config.enabled) {
          const integration = new IntegrationClass(config);
          await integration.onAddUser(user, workspaceId, eventType);
        }
      })
    );
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const slug = INTEGRATIONS[i]?.slug;
        Sentry.captureException(result.reason, {
          extra: {
            context: `Attempt ${slug} integration execution`,
            error: `Failed integration execution for ${slug} `,
          },
        });
      }
    });
  },

  async loadConfig(
    workspaceId: string,
    slug: IntegrationsKeys
  ): Promise<IntegrationConfig | null> {
    try {
      const integrationData =
        await db.integration.findByWorkspaceAndPlatformWithKeys({
          workspaceId,
          platform: slug,
        });
      if (integrationData == null) {
        return null;
      }
      const config = integrationData.integrationKeys.reduce<
        Record<string, string>
      >((acc, key) => {
        acc[key.keyName] = key.value;
        return acc;
      }, {});
      return {
        enabled: integrationData.enabled,
        values: config,
      };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: `Attempt ${slug} integration`,
          error: `Failed integration configuration for ${slug} `,
        },
      });
      throw error;
    }
  },
};

export default IntegrationHooks;
