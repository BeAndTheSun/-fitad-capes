import { WebhookService } from '@meltstudio/common/src/services/webhook-service';
import type { ActivityActions } from '@meltstudio/types';

export const handleWebhookEvent = async (body: {
  payload: {
    eventDate: Date;
    eventType: ActivityActions;
    eventTableName: string;
    data?: Record<string, unknown>;
  };
  workspaceId: string;
  targetUrl: string;
  name?: string;
  webhookId: string;
}): Promise<{
  status: string;
  response: unknown;
  errorMessage: string | null;
}> => {
  const result = await WebhookService.sendWebhook(body.targetUrl, body.payload);

  const { status, response: responseData, errorMessage } = result;

  return {
    status,
    response: responseData,
    errorMessage:
      status === 'failure' ? errorMessage || 'Failed to send webhook.' : null,
  };
};
