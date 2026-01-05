import axios from 'axios';

export class WebhookService {
  public static async sendWebhook(
    targetUrl: string,
    payload: unknown
  ): Promise<{
    status: string;
    response: unknown;
    errorMessage?: string | null;
  }> {
    try {
      const response = await axios.post(targetUrl, payload);

      if (!response) {
        return { status: 'failure', response: null };
      }
      const responseData = {
        status: response.status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: response.data,
      };
      return { status: 'success', response: responseData };
    } catch (error) {
      return {
        status: 'failure',
        response: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
