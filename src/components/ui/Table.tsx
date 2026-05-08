import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  keyExtractor?: (row: T) => string | number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Table<T = any>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data',
  keyExtractor,
}: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={keyExtractor ? keyExtractor(row) : i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-100 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4 text-gray-700">
                    {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
