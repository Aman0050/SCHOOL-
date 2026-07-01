import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { 
  Building2, Users, CreditCard, TrendingUp, AlertTriangle, Activity, Loader2, Download, CheckCircle2, TrendingDown, Minus, XCircle
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const SuperDashboard: React.FC = () => {
  // Initialize Socket.io listener for real-time updates
  useSocket();
  const [exporting, setExporting] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['superAdminDashboard'],
    queryFn: () => superAdminApi.getDashboardStats(),
    staleTime: 60 * 1000, // Stale in 60s, handled by socket invalidation primarily
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(format);
      const blob = await superAdminApi.exportDashboard(format);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eduxeno-executive-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-slate-400 font-bold animate-pulse text-sm">Aggregating live data streams...</p>
      </div>
    );
  }

  const { metrics, revenueTrend, alerts, forecasts } = data || { metrics: null, revenueTrend: [], alerts: [], forecasts: [] };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Command Center</h2>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <p className="text-slate-400 mt-2 text-sm">Real-time telemetry, revenue intelligence, and platform health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleExport('csv')} 
            disabled={!!exporting}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {exporting === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} CSV Export
          </button>
          <button 
            onClick={() => handleExport('pdf')} 
            disabled={!!exporting}
            className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF Report
          </button>
        </div>
      </div>

      {/* Primary Revenue KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-primary/20 border border-indigo-400/30">
           <div className="absolute top-0 right-0 p-6 opacity-20"><TrendingUp className="w-24 h-24" /></div>
           <p className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-2">Monthly Recurring Revenue (MRR)</p>
           <h3 className="text-4xl font-black text-white">{formatCurrency(metrics?.mrr || 0)}</h3>
           <div className="mt-4 flex items-center justify-between">
             <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg">
               ↑ Live Aggregation
             </div>
             <span className="text-xs font-bold text-indigo-200">Total ARR: {formatCurrency(metrics?.arr || 0)}</span>
           </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
           <div>
             <div className="flex justify-between items-start">
               <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Active Students (Global)</p>
               <Users className="w-5 h-5 text-primary" />
             </div>
             <h3 className="text-4xl font-black text-slate-900">{(metrics?.totalStudents || 0).toLocaleString()}</h3>
           </div>
           <div className="flex items-center justify-between text-xs font-bold mt-4">
              <span className="text-slate-500">Across {metrics?.activeSchools} active schools</span>
              <span className="text-emerald-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Growing</span>
           </div>
        </div>

        <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
           <div>
             <div className="flex justify-between items-start">
               <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Global Health Score</p>
               <Activity className={`w-5 h-5 ${metrics?.healthStatus === 'Excellent' ? 'text-emerald-500' : metrics?.healthStatus === 'Healthy' ? 'text-primary' : metrics?.healthStatus === 'At Risk' ? 'text-amber-500' : 'text-rose-500'}`} />
             </div>
             <div className="flex items-baseline gap-3">
               <h3 className="text-4xl font-black text-slate-900">{metrics?.healthScore || 100}</h3>
               <span className={`text-sm font-bold ${metrics?.healthStatus === 'Excellent' ? 'text-emerald-500' : metrics?.healthStatus === 'Healthy' ? 'text-primary' : metrics?.healthStatus === 'At Risk' ? 'text-amber-500' : 'text-rose-500'}`}>
                 {metrics?.healthStatus}
               </span>
             </div>
           </div>
           <div className="flex items-center justify-between text-xs font-bold mt-4">
              <span className="text-slate-500">Based on Attendance & Engagement</span>
           </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
         {[
           { label: 'Total Organizations', value: metrics?.totalSchools, icon: Building2, color: 'text-blue-400', bg: 'bg-primary/10' },
           { label: 'Paid Subscriptions', value: metrics?.activeSchools, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
           { label: 'Active Trials', value: metrics?.trialSchools, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
           { label: 'Churned / Expired', value: metrics?.expiredSchools, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
         ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                 <stat.icon className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
                 <h4 className="text-2xl font-black text-slate-900 leading-none">{stat.value || 0}</h4>
               </div>
            </div>
         ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-Time Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="font-bold text-slate-900 text-lg">Revenue Growth Trend</h3>
               <p className="text-xs text-slate-400 font-medium mt-1">Aggregated from live SaaSInvoices</p>
             </div>
             <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary cursor-pointer outline-none">
               <option>Last 6 Months</option>
             </select>
           </div>
           
           <div className="flex-1 w-full mt-4">
             {revenueTrend && revenueTrend.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                   <XAxis 
                     dataKey="name" 
                     stroke="#64748b" 
                     fontSize={12}
                     tickLine={false}
                     axisLine={false}
                     dy={10}
                   />
                   <YAxis 
                     stroke="#64748b" 
                     fontSize={12}
                     tickLine={false}
                     axisLine={false}
                     tickFormatter={(value) => `$${value}`}
                     dx={-10}
                   />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontSize: '12px' }}
                     itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                     formatter={(value: number) => [`$${value}`, 'Revenue']}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="revenue" 
                     stroke="#6366f1" 
                     strokeWidth={3}
                     dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                     activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
                   />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl">
                 <Activity className="w-8 h-8 text-slate-300 mb-2" />
                 <p className="text-slate-400 font-semibold text-sm">Waiting for revenue data...</p>
               </div>
             )}
           </div>
        </div>

        {/* Live Alert Center & Executive Insights */}
        <div className="space-y-6">
          
          {/* Live Alert Center */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Live Alert Center
            </h3>
            <div className="space-y-3">
              {alerts && alerts.map((alert: any) => (
                <div key={alert.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                  alert.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' :
                  alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                  'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                }`}>
                  {alert.type === 'error' ? <XCircle className="w-5 h-5 shrink-0" /> :
                   alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0" /> :
                   <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  <p className="text-xs font-medium leading-snug">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Insights */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 rounded-3xl border border-slate-800/50 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-32 h-32" /></div>
            <h3 className="font-bold text-indigo-300 mb-4 flex items-center gap-2 relative z-10">
              Executive Insights
            </h3>
            <div className="space-y-4 relative z-10">
              {forecasts && forecasts.map((forecast: any) => (
                <div key={forecast.id} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    forecast.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                    forecast.trend === 'down' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-primary/20 text-blue-400'
                  }`}>
                    {forecast.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> :
                     forecast.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> :
                     <Minus className="w-3.5 h-3.5" />}
                  </div>
                  <p className="text-xs font-semibold text-slate-300 leading-relaxed">{forecast.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
