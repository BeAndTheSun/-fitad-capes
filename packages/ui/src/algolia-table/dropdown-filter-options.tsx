import { Checkbox, DropdownMenuContent, Input } from '@meltstudio/theme';
import { forwardRef } from 'react';
import { useRefinementList } from 'react-instantsearch';

type FiltersDropdownMenuProps = {
  attribute: string;
  withSearch?: boolean;
};

export const FiltersDropdownMenu = forwardRef<
  HTMLDivElement,
  FiltersDropdownMenuProps
>(({ attribute, withSearch }, ref) => {
  const { items, searchForItems, refine, canRefine } = useRefinementList({
    attribute,
  });

  const handleItemClick = (value: string): void => {
    if (canRefine) refine(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    searchForItems(e.target.value);
  };

  return (
    <DropdownMenuContent align="start" ref={ref}>
      <div className="space-y-2 px-1">
        {withSearch && <Input placeholder="Search" onChange={handleSearch} />}

        <div className="flex flex-col justify-center gap-2 pb-2">
          {items.map((i) => (
            <div className="flex items-center space-x-2" key={i.value}>
              <Checkbox
                value={i.value}
                checked={i.isRefined}
                onCheckedChange={(): void => handleItemClick(i.value)}
                className="border-accent"
              />
              <p>{i.label}</p>
              <p className="rounded-full bg-accent px-1 text-xs text-secondary-foreground">
                {i.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DropdownMenuContent>
  );
});
