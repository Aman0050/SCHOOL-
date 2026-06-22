import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', collected: 40000, expected: 50000 },
  { name: 'Feb', collected: 45000, expected: 50000 },
  { name: 'Mar', collected: 52000, expected: 55000 },
  { name: 'Apr', collected: 48000, expected: 50000 },
  { name: 'May', collected: 61000, expected: 60000 },
  { name: 'Jun', collected: 58000, expected: 60000 },
];

export const FeeAnalyticsCharts: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Collection Trends</h3>
        <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300">
          <option>This Year</option>
          <option>Last Year</option>
        </select>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
