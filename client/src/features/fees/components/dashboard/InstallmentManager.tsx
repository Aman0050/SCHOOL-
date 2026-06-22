import React from 'react';
import { Calendar } from 'lucide-react';

export const InstallmentManager: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-amber-500" />
        Upcoming Installments
      </h3>
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-2 opacity-50" />
          <p>No upcoming installments this week</p>
        </div>
      </div>
    </div>
  );
};
