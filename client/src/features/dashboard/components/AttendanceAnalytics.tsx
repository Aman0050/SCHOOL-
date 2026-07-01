import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { AlertCircle, TrendingUp, ChevronDown } from 'lucide-react';
import { useSocket } from '../../../contexts/SocketContext';

export const AttendanceAnalytics: React.FC = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [timeframe, setTimeframe] = useState('THIS WEEK');

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['analytics', 'attendance', timeframe],
    queryFn: () => api.get(`/analytics/attendance?timeframe=${timeframe}`).then(res => res.data.data).catch(() => ({})),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket) return;
    
    const handleAttendanceEvent = () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'attendance'] });
    };

    socket.on('cache_invalidate:attendance', handleAttendanceEvent);
    socket.on('audit_event', (event: any) => {
      if (event.entity === 'ATTENDANCE') {
        handleAttendanceEvent();
      }
    });

    return () => {
      socket.off('cache_invalidate:attendance', handleAttendanceEvent);
      socket.off('audit_event', handleAttendanceEvent);
    };
  }, [socket, queryClient]);

  if (isLoading) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  let defaultTrend = [];
  if (timeframe === 'THIS WEEK') {
    defaultTrend = [
      { date: 'Mon', rate: 0 },
      { date: 'Tue', rate: 0 },
      { date: 'Wed', rate: 0 },
      { date: 'Thu', rate: 0 },
      { date: 'Fri', rate: 0 },
      { date: 'Sat', rate: 0 },
      { date: 'Sun', rate: 0 },
    ];
  } else if (timeframe === 'THIS MONTH') {
    defaultTrend = [
      { date: 'Week 1', rate: 0 },
      { date: 'Week 2', rate: 0 },
      { date: 'Week 3', rate: 0 },
      { date: 'Week 4', rate: 0 },
    ];
  } else {
    defaultTrend = [
      { date: 'Jan', rate: 0 },
      { date: 'Feb', rate: 0 },
      { date: 'Mar', rate: 0 },
      { date: 'Apr', rate: 0 },
      { date: 'May', rate: 0 },
      { date: 'Jun', rate: 0 },
    ];
  }

  // Only use backend data if it matches the length of our expected timeframe
  const isCorrectFormat = attendanceData?.trend?.length === defaultTrend.length;
  const hasData = attendanceData?.trend?.some((t: any) => t.rate > 0);
  const trendData = (isCorrectFormat && hasData) ? attendanceData.trend : defaultTrend;
  const atRiskStudents = attendanceData?.atRiskStudents || [];

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Chart Section */}
      <div className="flex-1 flex flex-col h-full min-h-[300px]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1">Attendance Overview</h3>
            <div className="flex items-end gap-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                0%
              </h2>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider uppercase">AVG ATTENDANCE</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
             <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1 uppercase">
                <TrendingUp className="w-3 h-3" />
                +0% VS LAST MONTH
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
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                domain={[0, 100]} 
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intelligence Section */}
      <div className="w-full md:w-64 flex flex-col">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          At-Risk Students
        </h4>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {atRiskStudents.length > 0 ? atRiskStudents.map((student: any) => (
            <div key={student.id} className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{student.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{student.class}</span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{student.currentRate}%</span>
              </div>
            </div>
          )) : (
             <div className="text-sm text-slate-500 p-4 text-center">No at-risk students found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
