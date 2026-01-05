import { useDeleteRecord } from '@meltstudio/client-common';
import { RemoveItemButton } from '@meltstudio/theme';
import type { FC } from 'react';

type Props = {
  data: {
    model: string;
    id: string;
  };
  onSuccessfulDelete: () => void;
};

export const DeleteRecord: FC<Props> = ({ data, onSuccessfulDelete }) => {
  const { mutateAsync, isLoading } = useDeleteRecord({
    model: data.model,
    id: data.id,
  });

  const handleDelete = async (): Promise<void> => {
    await mutateAsync(undefined);
    onSuccessfulDelete();
  };
  const singularModel =
    data.model.endsWith('s') && data.model.length > 1
      ? data.model.slice(0, -1)
      : data.model;

  return (
    <RemoveItemButton
      label={`this ${singularModel}`}
      onConfirmDelete={handleDelete}
      loading={isLoading}
    />
  );
};
