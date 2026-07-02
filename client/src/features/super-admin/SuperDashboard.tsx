import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { 
  Building2, Users, CreditCard, TrendingUp, AlertTriangle, Activity, Loader2, Download, CheckCircle2, TrendingDown, Minus, XCircle, Sparkles, ArrowUpRight
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, type Variants } from 'framer-motion';
import { exportToExcel } from '../../utils/excelExport';

export const SuperDashboard: React.FC = () => {
  // Initialize Socket.io listener for real-time updates
  useSocket();
  const [exporting, setExporting] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 6 Months');

  const { data, isLoading } = useQuery({
    queryKey: ['superAdminDashboard'],
    queryFn: () => superAdminApi.getDashboardStats(),
    staleTime: 60 * 1000, // Stale in 60s, handled by socket invalidation primarily
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(format);
      
      if (format === 'csv') {
        // Now using Excel export for CSV request to match enterprise standards
        if (!metrics) return;
        const formattedData = [
          { metric: 'Total Organizations', value: metrics.totalSchools },
          { metric: 'Paid Subscriptions', value: metrics.paidSchools },
          { metric: 'Active Trials', value: metrics.trialSchools },
          { metric: 'Churned / Expired', value: metrics.expiredSchools },
          { metric: 'Monthly Recurring Revenue (MRR)', value: metrics.mrr },
          { metric: 'Annual Recurring Revenue (ARR)', value: metrics.arr },
          { metric: 'Active Students (Global)', value: metrics.totalStudents },
          { metric: 'Global Health Score', value: metrics.healthScore },
          { metric: 'Health Status', value: metrics.healthStatus }
        ];

        await exportToExcel({
          filename: 'eduxeno-executive-report.xlsx',
          sheetName: 'Executive Dashboard',
          title: 'EduXeno Executive Dashboard Report',
          subtitle: `Generated on ${new Date().toLocaleString()}`,
          data: formattedData,
          columns: [
            { header: 'Metric', key: 'metric', width: 40 },
            { header: 'Value', key: 'value', width: 25 }
          ]
        });
      } else {
        const blob = await superAdminApi.exportDashboard('pdf');
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `eduxeno-executive-report.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
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

  const { metrics, revenueTrend, alerts, forecasts } = data || { metrics: null, revenueTrend: {}, alerts: [], forecasts: [] };
  const activeTrend = Array.isArray(revenueTrend) ? revenueTrend : (revenueTrend?.[selectedTimeframe] || []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-12 overflow-hidden selection:bg-indigo-500/30">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8"
      >
        
        {/* Header & Actions */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
                Executive Command Center
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Live Sync</span>
              </div>
            </div>
            <p className="text-slate-500 mt-2 text-sm font-medium ml-12">Real-time telemetry, revenue intelligence, and platform health.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExport('csv')} 
              disabled={!!exporting}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {exporting === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Excel Report
            </button>
            <button 
              onClick={() => handleExport('pdf')} 
              disabled={!!exporting}
              className="group flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {exporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />} PDF Report
            </button>
          </div>
        </motion.div>

        {/* Primary Revenue KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="group bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-1">
             <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
               <TrendingUp className="w-32 h-32 text-indigo-400" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             
             <div className="relative z-10">
               <p className="text-indigo-200/80 font-bold uppercase tracking-widest text-[11px] mb-3 flex items-center gap-2">
                 Monthly Recurring Revenue <ArrowUpRight className="w-3 h-3" />
               </p>
               <h3 className="text-5xl font-black text-white tracking-tight drop-shadow-sm">{formatCurrency(metrics?.mrr || 0)}</h3>
               <div className="mt-8 flex items-center justify-between bg-white/5 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                 <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                   <Activity className="w-3.5 h-3.5 animate-pulse" /> Live
                 </div>
                 <span className="text-xs font-bold text-indigo-200">Total ARR: <span className="text-white">{formatCurrency(metrics?.arr || 0)}</span></span>
               </div>
             </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="group bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 relative overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between">
             <div>
               <div className="flex justify-between items-start">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-3">Active Students (Global)</p>
                 <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                   <Users className="w-5 h-5" />
                 </div>
               </div>
               <h3 className="text-5xl font-black text-slate-900 tracking-tight">{(metrics?.totalStudents || 0).toLocaleString()}</h3>
             </div>
             <div className="flex items-center justify-between text-xs font-bold mt-8 p-4 bg-slate-50/80 rounded-2xl">
                <span className="text-slate-500">Across <span className="text-slate-800">{metrics?.activeSchools}</span> schools</span>
                <span className="text-emerald-500 flex items-center gap-1 bg-emerald-100/50 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" /> Growing
                </span>
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 relative overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between">
             <div>
               <div className="flex justify-between items-start">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-3">Global Health Score</p>
                 <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${metrics?.healthStatus === 'Excellent' ? 'bg-emerald-50 text-emerald-600' : metrics?.healthStatus === 'Healthy' ? 'bg-blue-50 text-blue-600' : metrics?.healthStatus === 'At Risk' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                   <Activity className="w-5 h-5" />
                 </div>
               </div>
               <div className="flex items-baseline gap-3">
                 <h3 className="text-5xl font-black text-slate-900 tracking-tight">{metrics?.healthScore || 100}</h3>
                 <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${metrics?.healthStatus === 'Excellent' ? 'bg-emerald-50 text-emerald-600' : metrics?.healthStatus === 'Healthy' ? 'bg-blue-50 text-blue-600' : metrics?.healthStatus === 'At Risk' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                   {metrics?.healthStatus}
                 </span>
               </div>
             </div>
             <div className="flex items-center justify-between text-xs font-bold mt-8 p-4 bg-slate-50/80 rounded-2xl text-slate-500">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Based on Engagement</span>
             </div>
          </motion.div>
        </div>

        {/* Secondary Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
           {[
             { label: 'Total Organizations', value: metrics?.totalSchools, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200 hover:shadow-indigo-500/10' },
             { label: 'Paid Subscriptions', value: metrics?.activeSchools, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200 hover:shadow-emerald-500/10' },
             { label: 'Active Trials', value: metrics?.trialSchools, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-200 hover:shadow-amber-500/10' },
             { label: 'Churned / Expired', value: metrics?.expiredSchools, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-200 hover:shadow-rose-500/10' },
           ].map((stat, i) => (
              <div key={i} className={`group bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${stat.border}`}>
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${stat.bg} ${stat.color}`}>
                   <stat.icon className="w-7 h-7" />
                 </div>
                 <div>
                   <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <h4 className="text-2xl font-black text-slate-800 leading-none">{stat.value || 0}</h4>
                 </div>
              </div>
           ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Real-Time Revenue Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col min-h-[450px]">
             <div className="flex justify-between items-center mb-8">
               <div>
                 <h3 className="font-bold text-slate-900 text-xl tracking-tight">Revenue Growth Trend</h3>
                 <p className="text-sm text-slate-500 font-medium mt-1">Aggregated from live SaaS invoices</p>
               </div>
               <select 
                 value={selectedTimeframe}
                 onChange={(e) => setSelectedTimeframe(e.target.value)}
                 className="bg-slate-50 border border-slate-200/60 text-sm font-bold text-slate-600 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer outline-none transition-all hover:bg-slate-100 shadow-sm"
               >
                 <option>This Week</option>
                 <option>This Month</option>
                 <option>This Year</option>
                 <option>Last 6 Months</option>
                 <option>Last Year</option>
               </select>
             </div>
             
             <div className="flex-1 w-full mt-4">
               {activeTrend && activeTrend.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={activeTrend} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                     <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                     <XAxis 
                       dataKey="name" 
                       stroke="#94a3b8" 
                       fontSize={12}
                       fontFamily="inherit"
                       tickLine={false}
                       axisLine={false}
                       dy={10}
                     />
                     <YAxis 
                       stroke="#94a3b8" 
                       fontSize={12}
                       fontFamily="inherit"
                       tickLine={false}
                       axisLine={false}
                       tickFormatter={(value) => `₹${value}`}
                       dx={-10}
                     />
                     <Tooltip 
                       contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderColor: '#e2e8f0', borderRadius: '16px', color: '#1e293b', fontSize: '13px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                       itemStyle={{ color: '#4f46e5', fontWeight: '900' }}
                       formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                       labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="revenue" 
                       stroke="#6366f1" 
                       strokeWidth={4}
                       fillOpacity={1} 
                       fill="url(#colorRevenue)" 
                       activeDot={{ r: 8, fill: '#4f46e5', strokeWidth: 4, stroke: '#ffffff', filter: 'drop-shadow(0px 4px 6px rgba(79,70,229,0.4))' }}
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                   <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                     <Activity className="w-8 h-8 text-indigo-300 animate-pulse" />
                   </div>
                   <p className="text-slate-500 font-semibold text-sm">Aggregating revenue data...</p>
                 </div>
               )}
             </div>
          </motion.div>

          {/* Live Alert Center & Executive Insights */}
          <motion.div variants={itemVariants} className="space-y-6">
            
            {/* Live Alert Center */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 flex flex-col h-full">
              <h3 className="font-bold text-slate-900 text-base mb-6 flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </div>
                Live Alert Center
              </h3>
              <div className="space-y-4">
                {alerts && alerts.length > 0 ? alerts.map((alert: any) => (
                  <div key={alert.id} className={`p-4 rounded-2xl border flex items-start gap-3 transition-transform hover:-translate-y-0.5 ${
                    alert.type === 'error' ? 'bg-rose-50/80 border-rose-100 text-rose-700' :
                    alert.type === 'warning' ? 'bg-amber-50/80 border-amber-100 text-amber-700' :
                    'bg-emerald-50/80 border-emerald-100 text-emerald-700'
                  }`}>
                    {alert.type === 'error' ? <XCircle className="w-5 h-5 shrink-0 text-rose-500" /> :
                     alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" /> :
                     <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />}
                    <p className="text-sm font-semibold leading-snug">{alert.message}</p>
                  </div>
                )) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                     <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                     <p className="text-sm font-semibold text-slate-500">All systems operational</p>
                  </div>
                )}
              </div>
            </div>



          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
