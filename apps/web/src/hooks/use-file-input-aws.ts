import { useUploadFile } from '@meltstudio/client-common';
import { getFileExtension } from '@meltstudio/core';
import axios from 'axios';

import type {
  UploadFileReturn,
  UseFileInputByProviderReturn,
} from '@/types/use-file-input';

export const useFileInputAWS = (): UseFileInputByProviderReturn => {
  const { mutateAsync: getUploadLink } = useUploadFile();

  const uploadFile = async (file: File): Promise<UploadFileReturn> => {
    const fileExtension = getFileExtension(file);
    const uploadData = await getUploadLink({
      fileExtension,
      contentLength: file.size,
    });
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await axios.put(uploadData.url, uint8Array, {
      headers: {
        'Content-Type': file.type,
      },
    });
    return { key: uploadData.key, url: uploadData.url };
  };

  return { uploadFile };
};
