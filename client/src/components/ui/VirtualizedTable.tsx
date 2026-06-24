import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: { key: keyof T | string; label: string; render?: (item: T) => React.ReactNode }[];
  rowHeight?: number;
}

export function VirtualizedTable<T>({ data, columns, rowHeight = 60 }: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => isMobile ? (columns.length * 36 + 24) : rowHeight,
    overscan: 5,
  });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <div className="w-full sm:min-w-[800px]">
          {/* Sticky Header (Hidden on mobile) */}
          <div className="hidden sm:flex bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            {columns.map((col, idx) => (
              <div key={idx} className="flex-1 p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">
                {col.label}
              </div>
            ))}
          </div>

          {/* Virtualized Body */}
          <div
            ref={parentRef}
            className="overflow-y-auto overflow-x-hidden custom-scrollbar"
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
                    className="absolute top-0 left-0 w-full flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors p-4 sm:p-0"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {/* Desktop View */}
                    <div className="hidden sm:flex w-full h-full">
                      {columns.map((col, colIdx) => (
                        <div key={colIdx} className="flex-1 p-4 flex items-center text-sm truncate">
                          {col.render ? col.render(item) : (item as any)[col.key]}
                        </div>
                      ))}
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="flex flex-col sm:hidden w-full space-y-2 justify-center h-full">
                      {columns.map((col, colIdx) => (
                        <div key={colIdx} className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0">
                          <span className="text-xs font-semibold text-slate-500 uppercase">{col.label}</span>
                          <div className="text-sm text-slate-900 dark:text-slate-100 text-right font-medium max-w-[60%]">
                            {col.render ? col.render(item) : (item as any)[col.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
