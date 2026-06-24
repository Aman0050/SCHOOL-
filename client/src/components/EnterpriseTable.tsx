import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, ChevronDown, ChevronUp, MoreHorizontal, Filter } from 'lucide-react';

interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (info: { row: T }) => React.ReactNode;
  sortable?: boolean;
}

interface EnterpriseTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onSearch?: (query: string) => void;
  title?: string;
  description?: string;
}

export function EnterpriseTable<T>({ data, columns, onSearch, title, description }: EnterpriseTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T, direction: 'asc'|'desc' } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchTerm) {
      result = result.filter((item: any) => 
        Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (sortConfig) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchTerm, sortConfig]);

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => isMobile ? (columns.length * 36 + 24) : 56, // Row height
    overscan: 5,
  });

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full max-h-[800px]">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {title && <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64"
            />
          </div>
          <button className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table Header (Hidden on Mobile) */}
      <div className="hidden sm:grid border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col, i) => (
          <div 
            key={i} 
            className={`px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''} flex items-center justify-between`}
            onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
          >
            {col.header}
            {col.sortable && col.accessorKey && sortConfig?.key === col.accessorKey && (
              sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <div ref={parentRef} className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowData = filteredData[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group p-4 sm:p-0"
              >
                {/* Desktop Grid */}
                <div className="hidden w-full h-full sm:grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
                  {columns.map((col, i) => (
                    <div key={i} className="px-6 py-4 flex items-center text-sm text-slate-700 dark:text-slate-300 truncate">
                      {col.cell ? col.cell({ row: rowData }) : col.accessorKey ? String(rowData[col.accessorKey] || '') : ''}
                    </div>
                  ))}
                </div>
                
                {/* Mobile Card */}
                <div className="flex flex-col sm:hidden space-y-2 h-full justify-center">
                  {columns.map((col, i) => (
                    <div key={i} className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{col.header}</span>
                      <div className="text-sm text-slate-900 dark:text-slate-100 text-right font-medium max-w-[60%]">
                        {col.cell ? col.cell({ row: rowData }) : col.accessorKey ? String(rowData[col.accessorKey] || '') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p>No records found</p>
          </div>
        )}
      </div>
      
      {/* Pagination / Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
        <div>Showing {filteredData.length} records</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Prev</button>
          <button className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
