import type { Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { Trans } from 'next-i18next';

import { Skeleton, TableBody, TableCell, TableRow } from '@/theme/index';

type DataTableBodyProps<TData> = {
  table: Table<TData>;
  error?: string | null;
  loading?: boolean | null;
};

export const DataTableBody = <TData,>(
  props: DataTableBodyProps<TData>
): React.ReactNode => {
  const { table, error, loading } = props;

  const { rows } = table.getRowModel();
  const columns = table
    .getAllColumns()
    .filter((column) => column.getIsVisible());
  const pageSize = table.getState().pagination.pageSize ?? 10;

  if (loading) {
    // using indexes as keys here is ok since rows and columns are going to
    // have the same content so there's no risk of losing information or
    // displaying the wrong thing
    const skeletonRows = Array(pageSize)
      .fill(0)
      .map((_, idx) => idx);
    const skeletonColumns = Array(columns.length)
      .fill(0)
      .map((_, idx) => idx);

    return (
      <TableBody>
        {skeletonRows.map((rowIdx) => (
          <TableRow key={rowIdx}>
            {skeletonColumns.map((columnIdx) => (
              <TableCell key={`${rowIdx}-${columnIdx}`}>
                <Skeleton className="h-4 w-40" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  if (error != null) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            {error}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <Trans>No results found.</Trans>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};
