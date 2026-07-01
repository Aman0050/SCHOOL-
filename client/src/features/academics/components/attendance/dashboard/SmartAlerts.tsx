import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export const SmartAlerts: React.FC<any> = ({ alerts = [] }) => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-amber-500" />
        Intelligence Alerts
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert: any, idx: number) => (
            <div key={idx} className={`p-3 rounded-xl flex gap-3 items-start border ${
              alert.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 
              'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
            }`}>
              <AlertTriangle className={`h-5 w-5 shrink-0 ${
                alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
              }`} />
              <div>
                <p className={`text-sm font-semibold capitalize ${
                  alert.severity === 'CRITICAL' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
                }`}>{alert.type.replace('_', ' ')}</p>
                <p className={`text-xs mt-1 ${
                  alert.severity === 'CRITICAL' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                }`}>{alert.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
            <p className="text-sm text-slate-500">No alerts at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
