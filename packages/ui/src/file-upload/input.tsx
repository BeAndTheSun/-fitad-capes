import { cn, Input } from '@meltstudio/theme';
import React, { useCallback, useEffect, useState } from 'react';
import type { Accept, FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

import { AddFile } from './add-file';
import { CropModal } from './crop';
import { FileDragOverlay } from './drag-overlay';
import { MultipleFiles } from './multiple-files';
import { SingleFile } from './single-file';

export type FileInputProps = {
  value?: File[];
  onChange?: (acceptedFiles: File[]) => void;
  onSelectFileFailure?: (fileRejections: FileRejection[]) => void;
  maxSize?: number;
  multiple?: boolean;
  accept?: Accept;
  /** Pass a FormControl if you are using react-hook-form, to ensure best accessibility */
  control?: React.FC;
  enableCrop?: boolean;
  cropAspectRatio?: number;
} & React.PropsWithChildren;

export const FileInput: React.FC<FileInputProps> = ({
  value,
  maxSize,
  multiple,
  accept,
  onChange,
  onSelectFileFailure,
  control,
  enableCrop = false,
  cropAspectRatio = 1,
}) => {
  const [selectedLocalFiles, setSelectedLocalFiles] = useState<File[]>([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentFileBeingCropped, setCurrentFileBeingCropped] =
    useState<File | null>(null);

  const selectedFiles = value !== undefined ? value : selectedLocalFiles;

  const isImageFile = (file: File): boolean => file.type.startsWith('image/');

  const createCroppedFileName = (originalFile: File): string => {
    const nameWithoutExtension = originalFile.name.replace(/\.[^/.]+$/, '');
    const extension = originalFile.name.split('.').pop() || '';
    return `${nameWithoutExtension} - cropped.${extension}`;
  };

  const processNextImageFile = useCallback(() => {
    if (pendingFiles.length > 0) {
      const nextFile = pendingFiles[0];
      if (nextFile && isImageFile(nextFile)) {
        const imageUrl = URL.createObjectURL(nextFile);
        setImageToCrop(imageUrl);
        setCurrentFileBeingCropped(nextFile);
        setCropModalOpen(true);
        setPendingFiles((prev) => prev.slice(1));
      } else if (nextFile) {
        const newFiles = multiple ? [...selectedFiles, nextFile] : [nextFile];
        setSelectedLocalFiles(newFiles);
        onChange?.(newFiles);
        setPendingFiles((prev) => prev.slice(1));
        setTimeout(processNextImageFile, 0);
      }
    }
  }, [pendingFiles, selectedFiles, multiple, onChange]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        onSelectFileFailure?.(fileRejections);
      }

      if (acceptedFiles.length > 0) {
        const imageFiles = acceptedFiles.filter((file) => isImageFile(file));
        const nonImageFiles = acceptedFiles.filter(
          (file) => !isImageFile(file)
        );

        if (nonImageFiles.length > 0) {
          if (multiple) {
            const newAndExistingFiles = [...selectedFiles, ...nonImageFiles];
            setSelectedLocalFiles(newAndExistingFiles);
            onChange?.(newAndExistingFiles);
          } else {
            const fileToAdd = nonImageFiles[0];
            if (fileToAdd) {
              setSelectedLocalFiles([fileToAdd]);
              onChange?.([fileToAdd]);
            }
          }
        }

        if (imageFiles.length > 0) {
          if (enableCrop) {
            setPendingFiles((prev) => [...prev, ...imageFiles]);
          } else {
            const fileToAdd = imageFiles[0];
            if (multiple) {
              const newAndExistingFiles = [...selectedFiles, ...imageFiles];
              setSelectedLocalFiles(newAndExistingFiles);
              onChange?.(newAndExistingFiles);
            } else if (fileToAdd) {
              setSelectedLocalFiles([fileToAdd]);
              onChange?.([fileToAdd]);
            }
          }
        }
      }
    },
    [selectedFiles, onChange, onSelectFileFailure, multiple, enableCrop]
  );

  useEffect(() => {
    if (pendingFiles.length > 0 && !cropModalOpen) {
      processNextImageFile();
    }
  }, [pendingFiles, cropModalOpen, processNextImageFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      noClick: true,
      multiple,
      maxSize,
      accept,
    });

  const removeFile = (fileToRemove: File): void => {
    if (multiple) {
      const filesArray = Array.isArray(selectedFiles) ? selectedFiles : [];
      const indexToRemove = filesArray.findIndex(
        (file) =>
          file.name === fileToRemove.name && file.size === fileToRemove.size
      );

      if (indexToRemove !== -1) {
        const filteredFiles = filesArray.filter(
          (_, index) => index !== indexToRemove
        );
        setSelectedLocalFiles(filteredFiles);
        onChange?.(filteredFiles);
      }
    } else {
      setSelectedLocalFiles([]);
      onChange?.([]);
    }
  };

  const handleCropComplete = (croppedFile: File): void => {
    const originalFile = currentFileBeingCropped;
    if (originalFile) {
      const croppedFileName = createCroppedFileName(originalFile);
      const renamedCroppedFile = new File([croppedFile], croppedFileName, {
        type: croppedFile.type,
        lastModified: croppedFile.lastModified,
      });

      const newFiles = multiple
        ? [...selectedFiles, renamedCroppedFile]
        : [renamedCroppedFile];
      setSelectedLocalFiles(newFiles);
      onChange?.(newFiles);
    }

    URL.revokeObjectURL(imageToCrop);
    setImageToCrop('');
    setCurrentFileBeingCropped(null);
    setCropModalOpen(false);
  };

  const handleCloseCropModal = (): void => {
    setCropModalOpen(false);
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop('');
    }
    setCurrentFileBeingCropped(null);

    if (pendingFiles.length > 0) {
      setTimeout(processNextImageFile, 100);
    }
  };

  const FormControlComp = control || React.Fragment;

  return (
    <>
      <div
        className={cn(
          'border-input flex min-h-[100px] items-center justify-center rounded-md border text-center relative'
        )}
        {...getRootProps()}
      >
        <div className="my-4 flex flex-col gap-4">
          {(!selectedFiles.length || multiple) && <AddFile onClick={open} />}
          {multiple ? (
            <MultipleFiles files={selectedFiles} onRemoveFile={removeFile} />
          ) : (
            <SingleFile
              file={
                Array.isArray(selectedFiles) ? selectedFiles[0] : selectedFiles
              }
              onRemoveFile={removeFile}
            />
          )}
        </div>
        {isDragActive && <FileDragOverlay isDragReject={isDragReject} />}
        {/* Passing the FormControl here will pass the correct id and aria to the input to link it with the FormLabel */}
        <FormControlComp>
          <Input type="file" {...getInputProps()} />
        </FormControlComp>
      </div>

      <CropModal
        open={cropModalOpen}
        onClose={handleCloseCropModal}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={cropAspectRatio}
      />
    </>
  );
};
