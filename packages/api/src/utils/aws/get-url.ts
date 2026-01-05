import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { startOfHour } from 'date-fns';

import { s3 } from '@/api/aws/s3-instance';
import { config } from '@/api/config';
import type { ObjectUrlSettings } from '@/api/types/aws-types';

import { fileExistsOnS3 } from './file-exists';

const DEFAULT_EXPIRATION_TIME = 86400; // 1 day

export async function getFileUrlS3(
  key: string,
  { signingDate, expirationTime }: ObjectUrlSettings = {}
): Promise<string | null> {
  const fileExists = await fileExistsOnS3(key);
  if (!fileExists) return null;
  const selectedExpirationTime = expirationTime || DEFAULT_EXPIRATION_TIME;
  // by default, only change signing date every hour
  // this allows to disk cache the image by always providing the same AWS url
  const signingDateToUse = signingDate || startOfHour(new Date());
  const command = new GetObjectCommand({
    Bucket: config.storage.bucketName,
    Key: key,
    // required for cache
    ResponseCacheControl: `public, max-age=${selectedExpirationTime}, immutable`,
  });

  return getSignedUrl(s3, command, {
    expiresIn: selectedExpirationTime,
    signingDate: signingDateToUse,
  });
}
