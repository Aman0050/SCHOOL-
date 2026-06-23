import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { IndianRupee } from 'lucide-react';

export const FeeAnalytics: React.FC = () => {
  const { data: feeData, isLoading } = useQuery({
    queryKey: ['analytics', 'fees'],
    queryFn: () => api.get('/analytics/fees').then(res => res.data.data),
  });

  if (isLoading) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  const revenueTrend = feeData?.revenueTrend || [];
  const defaulters = feeData?.defaulters || [];

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Chart Section */}
      <div className="flex-1 flex flex-col h-full min-h-[200px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Revenue Intelligence</h3>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{fill: '#334155', opacity: 0.2}}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Revenue" />
              <Bar dataKey="target" fill="#64748b" radius={[4, 4, 0, 0]} name="Target" opacity={0.5} />
            </BarChart>
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
