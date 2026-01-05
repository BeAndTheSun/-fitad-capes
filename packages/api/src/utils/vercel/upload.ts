import type { HandleUploadBody } from '@vercel/blob/client';
import { handleUpload } from '@vercel/blob/client';
import type { IncomingMessage } from 'http';

import { MAX_UPLOAD_FILE_SIZE } from '@/api/constants';

type UploadFileVercelBlobArgs<TPayload = undefined> = {
  body: HandleUploadBody;
  request: IncomingMessage | Request;
  /** optional payload to send to the backend on upload success */
  tokenPayload?: TPayload;
  allowedContentTypes?: string[];
  maximumSizeInBytes?: number;
};

export type UploadFileVercelBlobReturn =
  | { type: 'blob.generate-client-token'; clientToken: string }
  | { type: 'blob.upload-completed'; response: 'ok' };

export async function uploadFileVercelBlob<TPayload = undefined>({
  body,
  request,
  tokenPayload,
  allowedContentTypes,
  maximumSizeInBytes,
}: UploadFileVercelBlobArgs<TPayload>): Promise<UploadFileVercelBlobReturn> {
  const jsonResponse = await handleUpload({
    body,
    request,
    // eslint-disable-next-line @typescript-eslint/require-await
    onBeforeGenerateToken: async () => {
      return {
        allowedContentTypes,
        maximumSizeInBytes: maximumSizeInBytes ?? MAX_UPLOAD_FILE_SIZE,
        addRandomSuffix: false,
        tokenPayload: JSON.stringify({
          tokenPayload,
          // optional, sent to your server on upload completion
          // you could pass a user id from auth, or a value from clientPayload
        }),
      };
    },
    onUploadCompleted: async () => {
      // Get notified of client upload completion
      // ⚠️ This will not work on `localhost` websites,
      // Use ngrok or similar to get the full upload flow
    },
  });
  return jsonResponse;
}
