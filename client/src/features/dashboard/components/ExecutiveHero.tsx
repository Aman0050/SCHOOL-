import React, { useState } from 'react';
import { DownloadCloud, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../../lib/api';

import { useQuery } from '@tanstack/react-query';

const KpiCard = React.memo(({ kpi }: { kpi: any }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:bg-white/10 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {kpi.trend}
        </div>
      </div>
      <div className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
        {kpi.value}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.kpi.value === nextProps.kpi.value && prevProps.kpi.trend === nextProps.kpi.trend;
});

export const ExecutiveHero: React.FC = () => {
  const { data: kpisData, isLoading } = useQuery({
    queryKey: ['dashboard', 'executiveKpis'],
    queryFn: () => api.get('/dashboard/executive-kpis').then(res => res.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const kpis = kpisData?.kpis || [];

  return (
    <div className="w-full h-full rounded-2xl bg-slate-900 p-6 flex flex-col justify-between shadow-lg overflow-hidden relative text-white">
      <div className="absolute -right-40 -top-40 w-96 h-96 bg-primary/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
      <div className="absolute left-20 -bottom-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex justify-between items-center z-10 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">Executive Command Center</h2>
        </div>
      </div>

      {!kpis || kpis.length === 0 ? (
        <div className="flex-1 flex items-center justify-center z-10 min-h-[200px]">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
          {kpis.map((kpi: any) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
};
