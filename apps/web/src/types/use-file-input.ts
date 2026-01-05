export type UploadFileReturn = {
  /** Storage provider key */
  key: string;
  name?: string;
  url?: string;
};

export type UseFileInputReturn = {
  /** Returns the file key (the filename in object storage) */
  uploadFile: (file: File) => Promise<UploadFileReturn>;
  /** Returns a list of file keys (the filenames in object storage) */
  uploadMultipleFiles: (files: File[]) => Promise<UploadFileReturn[]>;
};

export type UseFileInputByProviderReturn = {
  /** Returns the file key (the filename in object storage) */
  uploadFile: (file: File) => Promise<UploadFileReturn>;
};
