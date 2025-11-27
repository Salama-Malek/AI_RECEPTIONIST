import { ReactNode } from 'react';
import clsx from 'clsx';

export type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  className?: string;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
};

export default function Table<T>({ columns, data, onRowClick, emptyMessage = 'No data' }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-surface-muted shadow-lg">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-900/40">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={clsx('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-sm">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={clsx(
                'hover:bg-slate-800/60 transition-colors',
                onRowClick ? 'cursor-pointer' : '',
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.header} className={clsx('px-4 py-3 text-slate-100', col.className)}>
                  {col.render ? col.render(row) : (row[col.accessor as keyof T] as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
