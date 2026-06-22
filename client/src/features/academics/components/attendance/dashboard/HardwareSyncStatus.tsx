import React from 'react';
import { Cpu, RefreshCw, Wifi } from 'lucide-react';

export const HardwareSyncStatus: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-slate-500" />
          Hardware Integration
        </h3>
        <button className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-500 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
              <Wifi className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Main Gate Biometric</p>
              <p className="text-xs text-slate-500">Last Sync: 2 mins ago</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">ONLINE</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
              <Wifi className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Library RFID Scanner</p>
              <p className="text-xs text-slate-500">Last Sync: 4 hours ago</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded-full">OFFLINE</span>
        </div>
      </div>
    </div>
  );
};
