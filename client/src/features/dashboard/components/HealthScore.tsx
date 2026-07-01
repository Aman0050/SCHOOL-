import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { ShieldAlert, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

export const HealthScore: React.FC = () => {
  const { data: health, isLoading } = useQuery({
    queryKey: ['dashboard', 'healthScore'],
    queryFn: () => api.get('/dashboard/health-score').then(res => res.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading || !health) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 41) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 41) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const isHealthy = health.overallScore >= 80;

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4 z-10">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            System Health
          </h3>
          <p className="text-sm text-slate-500 mt-1">Weighted operational metrics</p>
        </div>
        <div className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border shadow-sm ${getStatusColor(health.overallScore)}`}>
          {isHealthy ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
          <span className="text-xl font-black leading-none">{health.overallScore}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 z-10">
        {health.breakdown?.map((item: any) => (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {item.name} <span className="text-slate-400 font-normal">({item.weight}%)</span>
              </span>
              <span className="font-bold text-slate-800 dark:text-white">{item.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(item.score)}`} 
                style={{ width: `${item.score}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

      {health.rootCauses?.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl z-10">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Action Required:
          </p>
          <ul className="space-y-1.5">
            {health.rootCauses.map((cause: any, i: number) => (
              <li key={i} className="flex gap-2 items-start text-xs">
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cause.type === 'danger' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                <span className={`${cause.type === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>{cause.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
