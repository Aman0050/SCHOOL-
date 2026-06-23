import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { AlertCircle } from 'lucide-react';

export const AttendanceAnalytics: React.FC = () => {
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['analytics', 'attendance'],
    queryFn: () => api.get('/analytics/attendance').then(res => res.data.data),
  });

  if (isLoading) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  const trendData = attendanceData?.trend || [];
  const atRiskStudents = attendanceData?.atRiskStudents || [];

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Chart Section */}
      <div className="flex-1 flex flex-col h-full min-h-[200px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Attendance Trend</h3>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[60, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#60a5fa' }}
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
