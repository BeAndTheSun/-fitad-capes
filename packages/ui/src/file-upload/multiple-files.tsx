import { Button } from '@meltstudio/theme';
import { Cross1Icon, FileIcon } from '@radix-ui/react-icons';

export type MultipleFilesProps = {
  files: File[];
  onRemoveFile: (file: File) => void;
};

export const MultipleFiles: React.FC<MultipleFilesProps> = ({
  files,
  onRemoveFile,
}) => {
  const onClickRemoveFile = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    fileToRemove: File
  ): void => {
    event.stopPropagation();
    onRemoveFile(fileToRemove);
  };

  return (
    !!files.length && (
      <div className="mx-4 flex flex-wrap gap-x-4 gap-y-2">
        {files.map((file) => (
          <div className="flex items-center justify-center gap-2 rounded-md bg-input pl-2 font-sans text-sm font-medium">
            <FileIcon className="inline flex-none" />
            {file.name}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto h-7"
              onClick={(e): void => onClickRemoveFile(e, file)}
            >
              <Cross1Icon />
            </Button>
          </div>
        ))}
      </div>
    )
  );
};
