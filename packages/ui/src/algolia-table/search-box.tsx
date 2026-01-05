import { Input } from '@meltstudio/theme';
import type { FC } from 'react';
import { useSearchBox } from 'react-instantsearch';

type Props = {
  placeholder?: string;
};

export const SearchBox: FC<Props> = ({ placeholder }) => {
  const { refine, query } = useSearchBox();

  const handleRefineQuery = (e: React.ChangeEvent<HTMLInputElement>): void => {
    refine(e.target.value);
  };

  return (
    <div>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={handleRefineQuery}
        className="h-8 w-[150px] lg:w-[250px]"
      />
    </div>
  );
};
