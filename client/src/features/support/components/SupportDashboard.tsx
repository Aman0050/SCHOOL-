import React from 'react';
import { useSupport } from '../hooks/useSupport';
import { Loader2, Ticket, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../auth/authContext';

export const SupportDashboard: React.FC = () => {
  const { useDashboardStats } = useSupport();
  const { data: stats, isLoading } = useDashboardStats();
  const { user } = useAuth();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {user?.role === 'SUPER_ADMIN' ? 'Global Support Overview' : 'School Support Overview'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Open Tickets</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.open || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.inProgress || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Resolved</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.resolved || 0}</p>
          </div>
        </div>
      </div>
      
      {/* SLA metrics could be added here in future */}
    </div>
  );
};
