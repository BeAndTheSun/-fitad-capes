import { Cross1Icon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import React, { useState } from 'react';

import { Spinner } from '@/theme/components/ui/spinner';
import { Button } from '@/theme/index';

export enum ImagePreviewLoadErrorAction {
  showErrorIcon = 'showErrorIcon',
  clearPhoto = 'clearPhoto',
}

export type ImagePreviewProps = {
  photoUrl: string | undefined;
  /** action to do when the next.js <Image> tags reports that the file failed to load (isn't a valid image) */
  loadErrorAction: ImagePreviewLoadErrorAction;
  profileImageQuery: {
    isLoading: boolean;
    error: Error | null;
  };
  onClearPhoto: () => void | Promise<void>;
};

/**
 * Show an image in a circular container, with a button to delete the image
 * If the image is loading it shows a spinner, and will show an alert icon if the image loading throws an error
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  photoUrl,
  loadErrorAction,
  profileImageQuery,
  onClearPhoto,
}) => {
  const [nextImageError, setNextImageError] = useState<string | null>(null);
  const selectedImageCannotLoad = nextImageError === photoUrl;

  const handleImageLoadError = async (imageUrl: string): Promise<void> => {
    if (loadErrorAction === ImagePreviewLoadErrorAction.showErrorIcon) {
      setNextImageError(imageUrl);
    } else if (loadErrorAction === ImagePreviewLoadErrorAction.clearPhoto) {
      await onClearPhoto();
    }
  };

  return (
    <div className="relative size-[120px]">
      <Button
        variant="destructive"
        type="button"
        className="absolute right-0 top-0 size-8 rounded-full p-0"
        onClick={onClearPhoto}
      >
        <Cross1Icon />
      </Button>
      {photoUrl && !selectedImageCannotLoad ? (
        <Image
          alt="Profile avatar"
          src={photoUrl}
          unoptimized
          width={120}
          height={120}
          className="size-[120px] rounded-full border-2 border-input object-cover object-center"
          onError={(): Promise<void> => handleImageLoadError(photoUrl)}
          onLoad={(): void => {
            setNextImageError(null);
          }}
        />
      ) : (
        (profileImageQuery.isLoading ||
          profileImageQuery.error ||
          selectedImageCannotLoad) && (
          <div className="flex size-[120px] items-center justify-center rounded-full border-2 border-input">
            {profileImageQuery.isLoading ? (
              <Spinner size="medium" />
            ) : (
              (profileImageQuery.error || selectedImageCannotLoad) && (
                <ExclamationTriangleIcon className="size-[30px] text-red-600" />
              )
            )}
          </div>
        )
      )}
    </div>
  );
};
