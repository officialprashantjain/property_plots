'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from 'lucide-react';

const ALIGN_MAP = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
};

function SortIcon({ direction }) {
  if (direction === 'asc')  return <ChevronUp  size={13} className="text-primary" />;
  if (direction === 'desc') return <ChevronDown size={13} className="text-primary" />;
  return <ChevronsUpDown size={13} className="text-muted-dark opacity-50" />;
}

function SkeletonRows({ columns, rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-b border-border">
      {columns.map((col, j) => (
        <td key={j} className="px-5 py-3.5">
          <div className="h-4 rounded-md bg-border animate-pulse" style={{ width: `${55 + ((i + j) % 5) * 9}%` }} />
        </td>
      ))}
    </tr>
  ));
}

export default function DataTable({
  // Data
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found.',
  emptyIcon = '📭',

  // Search
  searchable = true,
  searchPlaceholder = 'Search…',
  searchKeys,

  // Sort
  sortable = true,

  // Pagination (client-side)
  paginated = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],

  // Server-side overrides
  serverSide = false,
  totalRows,
  currentPage: controlledPage,
  onPageChange,
  onSearch,

  // Toolbar slots
  toolbarLeft,
  toolbarRight,

  // Row
  onRowClick,
  rowClassName,
  className = '',
  tableMaxHeight = 'max-h-[calc(100vh-280px)]',
}) {
  const [query, setQuery]         = useState('');
  const [sort, setSort]           = useState({ key: null, dir: null }); // dir: 'asc'|'desc'
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(initialPageSize);

  // ── Derived: resolve active page (server vs client)
  const activePage = serverSide ? (controlledPage ?? 1) : page;

  // ── Client-side search
  const filtered = useMemo(() => {
    if (serverSide || !query.trim()) return data;
    const q = query.toLowerCase();
    const keys = searchKeys ?? columns.map(c => c.key).filter(Boolean);
    return data.filter(row =>
      keys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    );
  }, [data, query, searchKeys, columns, serverSide]);

  // ── Client-side sort
  const sorted = useMemo(() => {
    if (serverSide || !sort.key || !sort.dir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort, serverSide]);

  // ── Client-side pagination
  const total = serverSide ? (totalRows ?? data.length) : sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated_data = useMemo(() => {
    if (serverSide || !paginated) return sorted;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize, paginated, serverSide]);

  // ── Handlers
  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    setPage(1);
    if (serverSide && onSearch) onSearch(val);
  };

  const handleSort = (col) => {
    if (!sortable || !col.sortable) return;
    setSort(prev => {
      if (prev.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc')   return { key: col.key, dir: 'desc' };
      return { key: null, dir: null };
    });
  };

  const goToPage = (p) => {
    const clamped = Math.max(1, Math.min(p, totalPages));
    if (serverSide) { onPageChange?.(clamped); }
    else setPage(clamped);
  };

  const handlePageSize = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const rowCls = (row) =>
    typeof rowClassName === 'function' ? rowClassName(row) : (rowClassName ?? '');

  // ── Render
  return (
    <div className={`flex flex-col gap-0 rounded-xl border border-border bg-surface overflow-hidden shadow-sm ${className}`}>

      {/* ── Toolbar ── */}
      {(toolbarLeft || toolbarRight || searchable) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background">
          {/* Left slot */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {toolbarLeft}
          </div>

          {/* Right: search + custom slot */}
          <div className="flex items-center gap-2 shrink-0">
            {searchable && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={handleSearch}
                  placeholder={searchPlaceholder}
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition w-52"
                />
              </div>
            )}
            {toolbarRight}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className={`w-full overflow-auto ${tableMaxHeight}`}>
        <table className="w-full text-sm text-left relative">

          {/* Header */}
          <thead className="bg-background border-b border-border sticky top-0 z-10">
            <tr>
              {columns.map((col) => {
                const isSorted = sort.key === col.key;
                const canSort  = sortable && col.sortable;
                const align    = ALIGN_MAP[col.align ?? 'left'];
                return (
                  <th
                    key={col.key ?? col.label}
                    onClick={() => canSort && handleSort(col)}
                    className={`
                      px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap select-none
                      ${align}
                      ${col.width ?? ''}
                      ${col.headerClass ?? ''}
                      ${canSort ? 'cursor-pointer hover:text-foreground hover:bg-border/30 transition-colors' : ''}
                    `}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {canSort && <SortIcon direction={isSorted ? sort.dir : null} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <SkeletonRows columns={columns} rows={pageSize} />
            ) : paginated_data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted">
                    <span className="text-3xl">{emptyIcon}</span>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                    {query && (
                      <button
                        onClick={() => { setQuery(''); setPage(1); }}
                        className="text-xs text-primary underline underline-offset-2 hover:text-primary-hover transition"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated_data.map((row, rowIndex) => (
                <tr
                  key={row._id ?? row.id ?? rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    bg-surface transition-colors
                    ${onRowClick ? 'cursor-pointer hover:bg-primary/5' : ''}
                    ${rowCls(row)}
                  `}
                >
                  {columns.map((col) => {
                    const align = ALIGN_MAP[col.align ?? 'left'];
                    return (
                      <td
                        key={col.key ?? col.label}
                        className={`px-5 py-3.5 text-foreground whitespace-nowrap ${align} ${col.cellClass ?? ''}`}
                      >
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ── */}
      {(paginated || serverSide) && !isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-background text-xs text-muted">

          {/* Left: result count + page size */}
          <div className="flex items-center gap-3">
            <span>
              {total === 0
                ? 'No results'
                : `Showing ${Math.min((activePage - 1) * pageSize + 1, total)}–${Math.min(activePage * pageSize, total)} of ${total}`}
            </span>
            {!serverSide && pageSizeOptions?.length > 1 && (
              <select
                value={pageSize}
                onChange={handlePageSize}
                className="border border-border rounded-md px-2 py-1 text-xs bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
              >
                {pageSizeOptions.map(s => (
                  <option key={s} value={s}>{s} / page</option>
                ))}
              </select>
            )}
          </div>

          {/* Right: page buttons */}
          <div className="flex items-center gap-1">
            <PaginationButton onClick={() => goToPage(1)}           disabled={activePage === 1}          label="«" />
            <PaginationButton onClick={() => goToPage(activePage - 1)} disabled={activePage === 1}       label={<ChevronLeft size={13} />} />

            {/* Page number pills */}
            {getPaginationRange(activePage, totalPages).map((item, i) =>
              item === '…' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-dark select-none">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  className={`min-w-7 h-7 rounded-md text-xs font-medium transition-colors
                    ${activePage === item
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-border/60 hover:text-foreground'
                    }`}
                >
                  {item}
                </button>
              )
            )}

            <PaginationButton onClick={() => goToPage(activePage + 1)} disabled={activePage === totalPages} label={<ChevronRight size={13} />} />
            <PaginationButton onClick={() => goToPage(totalPages)}      disabled={activePage === totalPages} label="»" />
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationButton({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="min-w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors
        text-muted hover:bg-border/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

/** Smart page range: always show first/last + window around active page */
function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 1;
  const left  = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  const range = [1];
  if (left > 2)      range.push('…');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('…');
  range.push(total);
  return range;
}
