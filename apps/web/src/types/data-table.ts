export type FilterOption = {
  label: string;
  value: string;
};

export type TableFilter = {
  key: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
};
