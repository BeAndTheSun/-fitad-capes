import { StorageProvider } from '@/api/enums';
import { env } from '@/config/env';
import type {
  UploadFileReturn,
  UseFileInputReturn,
} from '@/types/use-file-input';

import { useFileInputAWS } from './use-file-input-aws';
import { useFileInputVercel } from './use-file-input-vercel';

export const useFileInput = (): UseFileInputReturn => {
  const { uploadFile: uploadFileAWS } = useFileInputAWS();
  const { uploadFile: uploadFileVercel } = useFileInputVercel();

  const uploadFile = (file: File): Promise<UploadFileReturn> => {
    if (env.NEXT_PUBLIC_FILE_STORAGE_PROVIDER === StorageProvider.AWS) {
      return uploadFileAWS(file);
    }
    if (env.NEXT_PUBLIC_FILE_STORAGE_PROVIDER === StorageProvider.VERCEL) {
      return uploadFileVercel(file);
    }
    throw new Error('Unexpected StorageProvider');
  };

  const processFile = async (file: File): Promise<UploadFileReturn> => {
    const uploadedFile = await uploadFile(file);
    return {
      key: uploadedFile.key,
      name: file.name,
      url: uploadedFile.url,
    };
  };

  const uploadMultipleFiles = async (
    files: File[]
  ): Promise<UploadFileReturn[]> => {
    return Promise.all(files.map(processFile));
  };

  return { uploadFile, uploadMultipleFiles };
};
