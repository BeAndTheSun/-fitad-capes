import type {
  __MetadataBearer,
  HeadObjectCommandInput,
} from '@aws-sdk/client-s3';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

import { s3 } from '@/api/aws/s3-instance';
import { config } from '@/api/config';

/**
 * Adapted from https://stackoverflow.com/a/70965497/14184507
 */
export async function fileExistsOnS3(key: string): Promise<boolean> {
  try {
    const bucketParams: HeadObjectCommandInput = {
      Bucket: config.storage.bucketName,
      Key: key,
    };
    // docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/HeadObjectCommand/
    const cmd = new HeadObjectCommand(bucketParams);
    const data = await s3.send(cmd);
    const exists = data.$metadata.httpStatusCode === 200;
    return exists;
  } catch (e) {
    const error = e as __MetadataBearer;
    if (error?.$metadata?.httpStatusCode === 404) {
      // doesn't exist and permission policy includes s3:ListBucket
      return false;
    }
    if (error?.$metadata?.httpStatusCode === 403) {
      // doesn't exist, permission policy WITHOUT s3:ListBucket
      return false;
    }
    // other error (maybe not enough permissions)
    throw e;
  }
}
