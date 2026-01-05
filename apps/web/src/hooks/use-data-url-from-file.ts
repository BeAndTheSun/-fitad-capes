import { fileToDataUrl } from '@meltstudio/core';
import { useEffect, useState } from 'react';

export const useDataUrlFromFile = (file: File | undefined): string | null => {
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  useEffect(() => {
    // guard to avoid race conditions
    let isCurrentEffect = true;
    const effect = async (): Promise<void> => {
      if (file) {
        const dataUrl = await fileToDataUrl(file);
        if (isCurrentEffect) {
          setFileDataUrl(dataUrl);
        }
      } else {
        setFileDataUrl(null);
      }
    };
    // eslint-disable-next-line no-void
    void effect();
    return () => {
      isCurrentEffect = false;
    };
  }, [file]);
  return fileDataUrl;
};
