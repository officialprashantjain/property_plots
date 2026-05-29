import React from 'react';

/**
 * Reusable Table component
 *
 * @param {Array} columns - Array of column definitions: [{ key, label, render }]
 *   - key: the object key to pull data from
 *   - label: the column header text
 *   - render: (optional) custom render function (row) => JSX
 * @param {Array} data - Array of row objects
 * @param {Function} onRowClick - (optional) called with the row object when user clicks a row
 * @param {string} emptyMessage - (optional) message shown when data is empty
 */
export default function Table({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No data available.',
  className = '',
}) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border ${className}`}>
      <table className="w-full text-sm text-left">

        {/* Header */}
        <thead className="bg-background border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-border bg-surface">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center text-muted text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row._id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-background'
                    : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-5 py-3.5 text-foreground whitespace-nowrap"
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
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
