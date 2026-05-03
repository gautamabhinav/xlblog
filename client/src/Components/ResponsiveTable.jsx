import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiChevronUp, FiChevronDown, FiLoader } from 'react-icons/fi';
import { useTheme, cn } from '../Hooks/useTheme';

/**
 * Responsive Table Component
 * - Theme-aware (dark/light mode)
 * - Sortable columns
 * - Loading states
 * - Empty states
 * - Responsive design with mobile-friendly fallback
 * 
 * @param {Object} props
 * @param {Array} props.columns - Column definitions: { key, label, sortable, render, width }
 * @param {Array} props.data - Table data
 * @param {Function} props.onSort - Callback for sorting
 * @param {String} props.sortBy - Current sort column
 * @param {String} props.sortOrder - 'asc' or 'desc'
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.title - Table title
 * @param {Function} props.onRowClick - Row click handler
 * @param {Boolean} props.striped - Striped rows
 */
export const ResponsiveTable = ({
  columns = [],
  data = [],
  onSort = () => {},
  sortBy = null,
  sortOrder = 'asc',
  loading = false,
  title = '',
  onRowClick = null,
  striped = true,
  emptyMessage = 'No data available',
}) => {
  const { colors } = useTheme();

  const sortedData = useMemo(() => {
    if (!sortBy || data.length === 0) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [data, sortBy, sortOrder]);

  const handleSort = (columnKey) => {
    onSort(columnKey);
  };

  if (loading) {
    return (
      <div className={cn('p-8 text-center', colors.bg.card)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <FiLoader size={32} className={colors.text.accent} />
        </motion.div>
        <p className={cn('mt-3', colors.text.secondary)}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className={cn('text-lg font-semibold mb-4', colors.text.accent)}>
          {title}
        </h3>
      )}

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
        <table className={cn('w-full text-sm', colors.text.primary)}>
          <thead className={cn('border-b', colors.border.light, colors.bg.secondary)}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left px-4 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity',
                    column.sortable ? 'cursor-pointer' : 'cursor-default'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <motion.div
                        animate={{
                          y: sortBy === column.key && sortOrder === 'desc' ? 2 : -2,
                        }}
                      >
                        {sortBy === column.key ? (
                          sortOrder === 'asc' ? (
                            <FiChevronUp size={16} />
                          ) : (
                            <FiChevronDown size={16} />
                          )
                        ) : (
                          <div className={cn('w-4 h-4', colors.text.tertiary)} />
                        )}
                      </motion.div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={cn('px-4 py-8 text-center', colors.text.tertiary)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors duration-200',
                    striped && idx % 2 === 0 ? 'bg-white/3 dark:bg-white/3' : '',
                    onRowClick ? 'cursor-pointer hover:bg-white/5' : 'hover:bg-white/3'
                  )}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {column.render ? (
                        column.render(row[column.key], row, idx)
                      ) : (
                        <span className="truncate">{row[column.key] ?? '—'}</span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="sm:hidden space-y-3">
        {sortedData.length === 0 ? (
          <div className={cn('p-6 text-center rounded-lg', colors.bg.card, colors.text.tertiary)}>
            {emptyMessage}
          </div>
        ) : (
          sortedData.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'p-4 rounded-lg border',
                colors.bg.card,
                colors.border.light,
                onRowClick ? 'cursor-pointer active:opacity-70' : ''
              )}
            >
              <div className="space-y-2">
                {columns.map((column) => (
                  <div key={column.key} className="flex justify-between gap-2 items-start">
                    <span className={cn('text-xs font-semibold', colors.text.tertiary)}>
                      {column.label}
                    </span>
                    <span className={cn('text-sm font-medium text-right flex-1', colors.text.primary)}>
                      {column.render ? (
                        column.render(row[column.key], row, idx)
                      ) : (
                        row[column.key] ?? '—'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer with row count */}
      {sortedData.length > 0 && (
        <div className={cn('mt-4 text-xs text-right', colors.text.tertiary)}>
          Showing {sortedData.length} of {data.length} rows
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;
