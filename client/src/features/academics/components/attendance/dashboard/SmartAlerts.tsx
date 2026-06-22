import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export const SmartAlerts: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-amber-500" />
        Intelligence Alerts
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Grade 10-A Attendance Drop</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Attendance has fallen below 75% for 3 consecutive days.</p>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Chronic Absenteeism</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">4 students in Grade 9 have missed more than 5 days this month.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
