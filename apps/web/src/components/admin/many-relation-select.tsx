import { useGetModelRelation } from '@meltstudio/client-common';
import { useMemo } from 'react';

import { MultiSelect } from '@/ui/index';

type RelationSelectProps = {
  model: string;
  relation: string;
  values?: string[];
  onSelect: (ids: string[]) => void;
};

const ManyRelationSelect: React.FC<RelationSelectProps> = ({
  model,
  relation,
  values,
  onSelect,
}) => {
  const { data: options } = useGetModelRelation({
    model,
    relation,
  });

  const handleChange = (newValues: string[]): void => {
    onSelect(newValues);
  };

  const optionsForSelect = useMemo(
    () =>
      options?.map(({ id, label }) => ({
        value: id,
        label,
      })) || [],
    [options]
  );

  return (
    <MultiSelect
      options={optionsForSelect}
      onValueChange={handleChange}
      value={values}
    />
  );
};

export { ManyRelationSelect };
