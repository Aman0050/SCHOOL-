import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Settings, AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Operations: React.FC = () => {
  const { data: operations, isLoading } = useQuery({
    queryKey: ['dashboard', 'operations'],
    queryFn: () => api.get('/dashboard/operations').then(res => res.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading || !operations) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden relative group">
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-4 z-10">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Operations Center
          </h3>
          <p className="text-sm text-slate-500 mt-1">Live action items requiring attention</p>
        </div>
        <div className="bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 dark:border-primary/30/20">
          {operations?.length || 0} Pending
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 z-10">
        {operations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 opacity-50" />
            <p className="text-sm">All operations caught up</p>
          </div>
        ) : (
          operations?.map((op: any) => (
            <div key={op.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col gap-2 hover:border-primary/30/30 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {op.title}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  op.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                  op.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {op.priority}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Assigned: {op.assignedTo}</span>
                </div>
                <Link to={op.link} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary dark:hover:text-indigo-400">
                  {op.action} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
