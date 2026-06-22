import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const StudentRiskMonitor: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Risk Monitor
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3 rounded-xl flex gap-3 items-start">
          <div className="h-8 w-8 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center shrink-0 font-bold text-xs text-red-700 dark:text-red-200">AJ</div>
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Alex Johnson</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Attendance: 62% (Critical)</p>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 rounded-xl flex gap-3 items-start">
          <div className="h-8 w-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center shrink-0 font-bold text-xs text-amber-700 dark:text-amber-200">SM</div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Sarah Miller</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Outstanding Fees: $1,200</p>
          </div>
        </div>
      </div>
    </div>
  );
};
