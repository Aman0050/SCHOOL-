import React from 'react';
import { Calendar, Clock, ArrowRight, Bell } from 'lucide-react';

export const InstallmentManager: React.FC<any> = () => {
  // Premium mock data for upcoming installments
  const installments = [
    { id: 1, title: 'Term 2 Tuition Fee', class: 'Class 10-A', amount: 15000, daysLeft: 3, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { id: 2, title: 'Annual Transport', class: 'Class 8-B', amount: 8500, daysLeft: 5, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/10' },
    { id: 3, title: 'Hostel Maintenance', class: 'Class 12-Sci', amount: 12000, daysLeft: 14, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ];

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden relative group">
      {/* Premium Notification Dot */}
      <div className="absolute top-6 right-6">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-amber-500" />
        Upcoming Installments
      </h3>
      
      <div className="flex-1 flex flex-col gap-3 mt-2">
        {installments.map((inst) => (
          <div key={inst.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group/item shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${inst.bg}`}>
                <Bell className={`h-4 w-4 ${inst.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{inst.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{inst.class}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3 mr-1 inline" /> Due in {inst.daysLeft} days
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="font-black text-slate-800 dark:text-white">₹{inst.amount.toLocaleString()}</span>
              <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity -translate-x-2 group-hover/item:translate-x-0" />
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 transition-colors uppercase tracking-wider">
        View All 24 Installments
      </button>
    </div>
  );
};
