import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { IndianRupee, TrendingUp, ChevronDown } from 'lucide-react';
import { useSocket } from '../../../contexts/SocketContext';

export const FeeAnalytics: React.FC = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [timeframe, setTimeframe] = useState('THIS WEEK');

  const { data: feeData, isLoading } = useQuery({
    queryKey: ['analytics', 'fees', timeframe],
    queryFn: () => api.get(`/analytics/fees?timeframe=${timeframe}`).then(res => res.data.data).catch(() => ({})),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket) return;
    
    const handleFeeEvent = () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'fees'] });
    };

    socket.on('cache_invalidate:fees', handleFeeEvent);
    socket.on('audit_event', (event: any) => {
      if (event.entity === 'PAYMENT' || event.entity === 'FEE') {
        handleFeeEvent();
      }
    });

    return () => {
      socket.off('cache_invalidate:fees', handleFeeEvent);
      socket.off('audit_event', handleFeeEvent);
    };
  }, [socket, queryClient]);

  if (isLoading) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  let defaultTrend = [];
  if (timeframe === 'THIS WEEK') {
    defaultTrend = [
      { month: 'Mon', revenue: 0, target: 10000 },
      { month: 'Tue', revenue: 0, target: 10000 },
      { month: 'Wed', revenue: 0, target: 10000 },
      { month: 'Thu', revenue: 0, target: 10000 },
      { month: 'Fri', revenue: 0, target: 10000 },
      { month: 'Sat', revenue: 0, target: 10000 },
      { month: 'Sun', revenue: 0, target: 10000 },
    ];
  } else if (timeframe === 'THIS MONTH') {
    defaultTrend = [
      { month: 'Week 1', revenue: 0, target: 40000 },
      { month: 'Week 2', revenue: 0, target: 40000 },
      { month: 'Week 3', revenue: 0, target: 40000 },
      { month: 'Week 4', revenue: 0, target: 40000 },
    ];
  } else {
    defaultTrend = [
      { month: 'Jan', revenue: 0, target: 50000 },
      { month: 'Feb', revenue: 0, target: 50000 },
      { month: 'Mar', revenue: 0, target: 50000 },
      { month: 'Apr', revenue: 0, target: 50000 },
      { month: 'May', revenue: 0, target: 50000 },
      { month: 'Jun', revenue: 0, target: 50000 },
    ];
  }

  // Only use backend data if it matches the length of our expected timeframe
  const isCorrectFormat = feeData?.revenueTrend?.length === defaultTrend.length;
  const hasData = feeData?.revenueTrend?.some((t: any) => t.revenue > 0);
  const revenueTrend = (isCorrectFormat && hasData) ? feeData.revenueTrend : defaultTrend;
  const defaulters = feeData?.defaulters || [];

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Chart Section */}
      <div className="flex-1 flex flex-col h-full min-h-[300px]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1">Revenue Overview</h3>
            <div className="flex items-end gap-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                <IndianRupee className="w-6 h-6 mr-1" strokeWidth={3} />
                0
              </h2>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider uppercase">TOTAL REVENUE</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
             <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1 uppercase">
                <TrendingUp className="w-3 h-3" />
                +100% VS LAST MONTH
             </div>
             <div className="relative mt-1">
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer"
                >
                  <option>THIS WEEK</option>
                  <option>THIS MONTH</option>
                  <option>LAST 6 MONTHS</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
             </div>
          </div>
        </div>
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
               <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
               <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                 tickFormatter={(val) => {
                   if (val >= 1000) return `₹${val / 1000}k`;
                   return `₹${val}`;
                 }}
                 domain={[0, (dataMax: number) => Math.max(dataMax, 10000)]}
               />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                 itemStyle={{ color: '#f59e0b' }}
               />
               <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
             </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intelligence Section */}
      <div className="w-full md:w-64 flex flex-col">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-amber-500" />
          Top Defaulters
        </h4>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {defaulters.length > 0 ? defaulters.map((student: any) => (
            <div key={student.id} className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{student.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{student.class}</span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">₹{student.amount}</span>
              </div>
            </div>
          )) : (
             <div className="text-sm text-slate-500 p-4 text-center">No defaulters found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
