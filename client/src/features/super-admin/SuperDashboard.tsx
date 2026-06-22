import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { 
  Building2, Users, CreditCard, TrendingUp, AlertTriangle, Activity, Loader2
} from 'lucide-react';

export const SuperDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['superAdminDashboard'],
    queryFn: () => superAdminApi.getDashboardStats()
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const { metrics, recentTickets } = data || { metrics: null, recentTickets: [] };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Executive Dashboard</h2>
        <p className="text-slate-400 mt-2">Platform revenue, school health, and usage metrics.</p>
      </div>

      {/* Primary Revenue KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
           <div className="absolute top-0 right-0 p-6 opacity-20"><TrendingUp className="w-24 h-24" /></div>
           <p className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-2">Monthly Recurring Revenue</p>
           <h3 className="text-4xl font-black text-white">{formatCurrency(metrics?.mrr || 0)}</h3>
           <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg">
             ↑ 12.5% vs last month
           </div>
        </div>
        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden border border-slate-800 shadow-xl">
           <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Annual Recurring Revenue</p>
           <h3 className="text-4xl font-black text-white">{formatCurrency(metrics?.arr || 0)}</h3>
           <div className="mt-4 flex items-center gap-2">
             <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%] rounded-full"></div>
             </div>
             <span className="text-xs font-bold text-slate-500">65% to Goal</span>
           </div>
        </div>
        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between">
           <div>
             <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Active Students</p>
             <h3 className="text-4xl font-black text-white">{(metrics?.totalStudents || 0).toLocaleString()}</h3>
           </div>
           <div className="flex items-center justify-between text-xs font-bold mt-4">
              <span className="text-slate-500">Across {metrics?.activeSchools} active schools</span>
              <span className="text-indigo-400 flex items-center gap-1"><Users className="w-3 h-3" /> Network</span>
           </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
         {[
           { label: 'Total Schools', value: metrics?.totalSchools, icon: Building2, color: 'text-blue-400' },
           { label: 'Active Subscriptions', value: metrics?.activeSchools, icon: Activity, color: 'text-emerald-400' },
           { label: 'Trial Schools', value: metrics?.trialSchools, icon: CreditCard, color: 'text-amber-400' },
           { label: 'Expired/Churned', value: metrics?.expiredSchools, icon: AlertTriangle, color: 'text-rose-400' },
         ].map((stat, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
               <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center ${stat.color} border border-slate-700/50`}>
                 <stat.icon className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
                 <h4 className="text-2xl font-bold text-white">{stat.value || 0}</h4>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Placeholder for Analytics Chart */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 min-h-[400px] flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-white">Revenue Growth Trend</h3>
             <select className="bg-slate-800 border-0 text-sm text-slate-300 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer outline-none">
               <option>Last 6 Months</option>
               <option>Year to Date</option>
             </select>
           </div>
           <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500 font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5" /> Charting library integration pending
              </p>
           </div>
        </div>

        {/* Global Support Feed */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-white flex items-center gap-2">
               Active Alerts <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full">{recentTickets?.length || 0}</span>
             </h3>
           </div>
           
           <div className="flex-1 space-y-4">
             {recentTickets?.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-sm font-semibold">Inbox Zero</p>
                  <p className="text-xs">No active support tickets.</p>
                </div>
             ) : (
               recentTickets?.map((ticket: any) => (
                  <div key={ticket.id} className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        ticket.priority === 'HIGH' || ticket.priority === 'URGENT' 
                          ? 'bg-rose-500/20 text-rose-400' 
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {ticket.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1 line-clamp-1">{ticket.title}</h4>
                    <p className="text-xs text-slate-400 font-medium truncate">{ticket.tenant.name}</p>
                  </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
