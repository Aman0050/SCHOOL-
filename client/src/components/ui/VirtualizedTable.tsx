import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: { key: keyof T | string; label: string; render?: (item: T) => React.ReactNode }[];
  rowHeight?: number;
}

export function VirtualizedTable<T>({ data, columns, rowHeight = 60 }: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      {/* Sticky Header */}
      <div className="flex bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        {columns.map((col, idx) => (
          <div key={idx} className="flex-1 p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">
            {col.label}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: '400px', // Example fixed height for the container
          width: '100%',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className="absolute top-0 left-0 w-full flex border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex-1 p-4 flex items-center text-sm truncate">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
