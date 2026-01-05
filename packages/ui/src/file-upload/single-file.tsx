import { Button } from '@meltstudio/theme';
import { FileIcon } from '@radix-ui/react-icons';
import { Trans } from 'next-i18next';

export type SingleFilesProps = {
  file: File | undefined;
  onRemoveFile: (file: File) => void;
};

export const SingleFile: React.FC<SingleFilesProps> = ({
  file,
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
    file && (
      <div className="ml-4 flex items-center justify-center gap-2">
        <FileIcon className="inline flex-none" />
        {file.name}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="ml-auto h-8"
          onClick={(e): void => onClickRemoveFile(e, file)}
        >
          <Trans>Remove</Trans>
        </Button>
      </div>
    )
  );
};
