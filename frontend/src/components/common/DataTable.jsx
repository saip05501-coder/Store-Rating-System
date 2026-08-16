import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  emptyMessage = 'No records found.',
}) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search Toolbar */}
      {onSearchChange !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              className="input-modern"
              style={{ paddingLeft: '2.4rem' }}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="badge badge-primary">
            Showing {data.length} of {total} entries
          </div>
        </div>
      )}

      {/* Table Structure */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: limit > 5 ? 5 : limit }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx}>
                      <div className="skeleton" style={{ height: '20px', width: '75%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={row.id || rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      {col.render ? col.render(row, rIdx) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total records)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
