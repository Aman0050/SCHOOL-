import React from 'react';
import { motion } from 'framer-motion';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 10 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {colIndex === 0 && (
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                      )}
                      <div className="space-y-2 w-full">
                        <div className={`h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse ${colIndex === 0 ? 'w-32' : 'w-24'}`} />
                        {colIndex === 0 && <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
