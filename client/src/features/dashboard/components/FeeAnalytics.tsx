import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', collected: 4000, pending: 2400 },
  { name: 'Feb', collected: 3000, pending: 1398 },
  { name: 'Mar', collected: 2000, pending: 9800 },
  { name: 'Apr', collected: 2780, pending: 3908 },
  { name: 'May', collected: 1890, pending: 4800 },
  { name: 'Jun', collected: 2390, pending: 3800 },
];

export const FeeAnalytics: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Fee Analytics</h3>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              cursor={{fill: '#334155', opacity: 0.2}}
            />
            <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
            <Bar dataKey="pending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
