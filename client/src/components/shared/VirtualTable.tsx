import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (info: { row: T }) => React.ReactNode;
  width?: number;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  rowHeight?: number;
}

export function VirtualTable<T>({ 
  data, 
  columns, 
  height = 500, 
  rowHeight = 60 
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center font-bold text-sm text-slate-500 uppercase tracking-wider sticky top-0 z-10">
        {columns.map((col, i) => (
          <div 
            key={i} 
            className="px-6 py-4 truncate"
            style={{ width: col.width ? `${col.width}px` : 'flex-1', flexGrow: col.width ? 0 : 1 }}
          >
            {col.header}
          </div>
        ))}
      </div>
      
      <div 
        ref={parentRef} 
        style={{ height: `${height}px`, overflow: 'auto' }}
        className="relative custom-scrollbar"
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowData = data[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className="absolute top-0 left-0 w-full flex items-center border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map((col, i) => (
                  <div 
                    key={i} 
                    className="px-6 py-4 truncate text-slate-700 dark:text-slate-300"
                    style={{ width: col.width ? `${col.width}px` : 'flex-1', flexGrow: col.width ? 0 : 1 }}
                  >
                    {col.cell ? col.cell({ row: rowData }) : String(rowData[col.accessorKey as keyof T])}
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

export default VirtualTable;
