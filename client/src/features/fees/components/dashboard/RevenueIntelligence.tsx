import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

export const RevenueIntelligence: React.FC<any> = ({ stats }) => {
  const expected = stats?.totalAssigned || 0;
  const collected = stats?.totalCollected || 0;
  const gap = expected - collected;
  const percentage = expected > 0 ? Math.round((collected / expected) * 100) : 0;

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-indigo-500" />
        Revenue Intelligence
      </h3>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500 font-medium">Collection Progress</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-6">
          <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Expected Revenue</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">₹{expected.toLocaleString()}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">Revenue Gap</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">₹{gap.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
