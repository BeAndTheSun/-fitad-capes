import { logger } from '@meltstudio/logger';
import type { ActivityActions } from '@meltstudio/types';

import { db } from '@/common/db';
import { handleWebhookEvent } from '@/common/handlers/webhook/handler-event';
import { errorHandler } from '@/common/utils/error-handler';
import { TableNames } from '@/db/schema';

type AddUserCall = {
  email: string;
  role: string;
};

class ZapierClient {
  // eslint-disable-next-line class-methods-use-this
  public async addUser(
    user: AddUserCall,
    workspaceId: string,
    eventType: ActivityActions
  ): Promise<void> {
    const webhooks =
      await db.webhooks.findUrlsAndNamesByWorkspaceId(workspaceId);

    if (!webhooks.length) {
      throw new Error('No webhooks found for this workspace.');
    }

    const sendWebhook = async ({
      url,
      name,
      id,
    }: {
      url: string;
      name: string;
      id: string;
    }): Promise<void> => {
      const body = {
        payload: {
          eventDate: new Date(),
          eventType,
          eventTableName: TableNames.USERS,
          data: {
            userEmail: user.email,
            role: user.role,
          },
        },
        workspaceId,
        targetUrl: url,
        name,
        webhookId: id,
      };

      try {
        const response = await handleWebhookEvent(body);
        logger.info(`Webhook sent to ${url} — status: ${response.status}`);
      } catch (error) {
        errorHandler({
          error,
          body: { ...body },
          transactionName: 'createUserZap',
        });
      }
    };

    await Promise.all(webhooks.map(sendWebhook));
  }
}

export default ZapierClient;
