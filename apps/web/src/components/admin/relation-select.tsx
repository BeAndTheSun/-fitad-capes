import { useGetModelRelation } from '@meltstudio/client-common';
import { Trans } from 'next-i18next';
import React from 'react';

type RelationSelectProps = {
  model: string;
  relation?: string;
  onChange: (value: string) => void;
  defaultValue?: string;
};

const RelationSelect: React.FC<RelationSelectProps> = ({
  model,
  relation,
  onChange,
  defaultValue,
}) => {
  const {
    data: options,
    isLoading,
    error,
  } = useGetModelRelation({
    model,
    relation,
  });

  return (
    <div>
      <select
        onChange={(e): void => onChange(e.target.value)}
        disabled={isLoading}
        value={defaultValue}
      >
        <option value="">
          <Trans>Select an option</Trans>
        </option>
        {options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {isLoading && (
        <p>
          <Trans>Loading options</Trans>...
        </p>
      )}
      {error && (
        <p>
          <Trans>Error loading options</Trans>: {error.message}
        </p>
      )}
    </div>
  );
};

export { RelationSelect };
