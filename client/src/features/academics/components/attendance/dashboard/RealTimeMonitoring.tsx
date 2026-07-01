import React from 'react';
import { Target } from 'lucide-react';

export const RealTimeMonitoring: React.FC<any> = ({ submissionStatus }) => {
  const statusArray = Array.isArray(submissionStatus) ? submissionStatus : [];
  const submitted = statusArray.filter(s => s.submitted).length;
  const pending = statusArray.filter(s => !s.submitted).length;
  const total = submitted + pending;
  const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-emerald-500" />
        Submission Tracking
      </h3>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500 font-medium">Classes Submitted Today</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-6">
          <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Submitted</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{submitted} Classes</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">Pending</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{pending} Classes</div>
          </div>
        </div>
      </div>
    </div>
  );
};
