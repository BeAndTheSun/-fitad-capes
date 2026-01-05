import type { AddUserForZapier } from '@meltstudio/common/src/handlers/implementations/zapier/add-user-in-zapier';
import addUserInZapier from '@meltstudio/common/src/handlers/implementations/zapier/add-user-in-zapier';
import type { ActivityActions } from '@meltstudio/types';
import { IntegrationsKeys } from '@meltstudio/types';

import Integration from './base';

class ZapierIntegration extends Integration {
  public static override slug = IntegrationsKeys.Zapier;

  // eslint-disable-next-line class-methods-use-this
  public override onAddUser(
    user: AddUserForZapier,
    workspaceId: string,
    eventType: ActivityActions
  ): Promise<unknown> {
    return addUserInZapier(user, workspaceId, eventType);
  }
}

export default ZapierIntegration;
