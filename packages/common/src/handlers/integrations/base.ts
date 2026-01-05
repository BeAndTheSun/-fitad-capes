import type {
  ActivityActions,
  IntegrationConfig,
  IntegrationsKeys,
} from '@meltstudio/types';

abstract class Integration {
  public static slug: IntegrationsKeys;

  public config: IntegrationConfig;

  public constructor(config: IntegrationConfig) {
    this.config = config;
  }

  public abstract onAddUser(
    user: unknown,
    workspaceId: string,
    eventType: ActivityActions
  ): Promise<unknown>;
}
export default Integration;
