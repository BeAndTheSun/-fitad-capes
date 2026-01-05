import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

import { s3 } from '@/api/aws/s3-instance';
import { config } from '@/api/config';
import type { ObjectUrlSettings } from '@/api/types/aws-types';

const DEFAULT_EXPIRATION_TIME = 600; // 10 minutes

type CreateFileUrlArgs = {
  fileExtension: string;
  contentLength: number;
};

export type CreateFileUrlReturn = {
  key: string;
  url: string;
};

export async function getUploadFileUrlS3(
  { fileExtension, contentLength }: CreateFileUrlArgs,
  { signingDate, expirationTime }: ObjectUrlSettings = {}
): Promise<CreateFileUrlReturn> {
  const selectedExpirationTime = expirationTime || DEFAULT_EXPIRATION_TIME;
  const key = `${uuid()}${fileExtension}`;
  const command = new PutObjectCommand({
    Bucket: config.storage.bucketName,
    Key: key,
    ContentLength: contentLength,
  });

  return {
    key,
    url: await getSignedUrl(s3, command, {
      expiresIn: selectedExpirationTime,
      signingDate,
      signableHeaders: new Set(['content-length']),
    }),
  };
}
