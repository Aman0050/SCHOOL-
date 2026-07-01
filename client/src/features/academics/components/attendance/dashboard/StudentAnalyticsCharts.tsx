import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const StudentAnalyticsCharts: React.FC<any> = ({ stats }) => {
  const [timeframe, setTimeframe] = useState('THIS WEEK');

  let defaultTrend: any[] = [];
  if (timeframe === 'TODAY') {
    defaultTrend = [
      { date: '8 AM', rate: 0 },
      { date: '10 AM', rate: 0 },
      { date: '12 PM', rate: 0 },
      { date: '2 PM', rate: 0 },
      { date: '4 PM', rate: 0 },
    ];
  } else if (timeframe === 'THIS WEEK') {
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

  // Backend usually sends a 7-day array for "THIS WEEK"
  const backendTrend = stats?.trend?.map((t: any) => ({ date: t.date, rate: t.rate })) || [];
  
  const isCorrectFormat = backendTrend.length === defaultTrend.length;
  const hasData = backendTrend.some((t: any) => t.rate > 0);
  const data = (isCorrectFormat && hasData) ? backendTrend : defaultTrend;

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Attendance Trends</h3>
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-lg px-3 py-1.5 outline-none text-slate-600 dark:text-slate-300 transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500"
        >
          <option value="TODAY">Today</option>
          <option value="THIS WEEK">This Week</option>
          <option value="THIS MONTH">This Month</option>
          <option value="LAST 6 MONTHS">Last 6 Months</option>
        </select>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
            />
            <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
