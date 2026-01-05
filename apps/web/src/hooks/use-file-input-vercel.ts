import { getUploadFileVercelPath } from '@meltstudio/client-common';
import { getFileExtension } from '@meltstudio/core';
import { upload as uploadVercelBlob } from '@vercel/blob/client';
import { v4 as uuid } from 'uuid';

import type {
  UploadFileReturn,
  UseFileInputByProviderReturn,
} from '@/types/use-file-input';

export const useFileInputVercel = (): UseFileInputByProviderReturn => {
  const uploadFile = async (file: File): Promise<UploadFileReturn> => {
    const fileExtension = getFileExtension(file);
    const pathname = `${uuid()}${fileExtension}`;
    const path = getUploadFileVercelPath();
    const data = await uploadVercelBlob(pathname, file, {
      access: 'public',
      handleUploadUrl: path,
    });
    return { key: pathname, url: data.url };
  };

  return { uploadFile };
};
