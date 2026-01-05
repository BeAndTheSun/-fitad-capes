import { DeleteObjectCommand } from '@aws-sdk/client-s3';

import { s3 } from '@/api/aws/s3-instance';
import { config } from '@/api/config';

export async function deleteFileS3(id: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: config.storage.bucketName,
      Key: id,
    })
  );
}
