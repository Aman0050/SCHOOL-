import React from 'react';
import { AlertCircle, FileText, CalendarClock, DollarSign } from 'lucide-react';

export const CriticalAction: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        Critical Action Center
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
          <div>
            <div className="text-red-600 dark:text-red-400 font-bold text-lg">14</div>
            <div className="text-sm text-red-500 dark:text-red-400/80">High Risk Defaulters</div>
          </div>
          <DollarSign className="h-8 w-8 text-red-200 dark:text-red-500/30" />
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
          <div>
            <div className="text-amber-600 dark:text-amber-400 font-bold text-lg">8</div>
            <div className="text-sm text-amber-500 dark:text-amber-400/80">Missing Attendance</div>
          </div>
          <CalendarClock className="h-8 w-8 text-amber-200 dark:text-amber-500/30" />
        </div>
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
          <div>
            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">12</div>
            <div className="text-sm text-blue-500 dark:text-blue-400/80">Pending Approvals</div>
          </div>
          <FileText className="h-8 w-8 text-blue-200 dark:text-blue-500/30" />
        </div>
      </div>
    </div>
  );
};
