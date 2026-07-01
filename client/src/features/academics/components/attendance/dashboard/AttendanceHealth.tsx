import React from 'react';
import { Activity } from 'lucide-react';

export const AttendanceHealth: React.FC<any> = ({ stats }) => {
  const getHealthColor = (score: string) => {
    switch (score) {
      case 'Excellent': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'Good': return 'text-primary bg-primary/10 dark:bg-primary/10 border-primary/30 dark:border-primary/30/20';
      case 'Warning': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'Critical': return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20';
    }
  };

  const healthScore = stats?.healthScore || 'Pending';
  const colorClasses = getHealthColor(healthScore);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        Attendance Health
      </h3>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`w-full text-center py-6 rounded-xl border ${colorClasses}`}>
          <div className="text-3xl font-black uppercase tracking-wider">{healthScore}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full mt-6">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Late Arrivals</div>
            <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stats?.students?.late || 0}</div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Compliance</div>
            <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">{Math.round(stats?.students?.rate || 0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
