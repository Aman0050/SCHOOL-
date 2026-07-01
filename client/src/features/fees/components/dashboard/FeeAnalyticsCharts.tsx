import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';

interface FeeAnalyticsChartsProps {
  trendData?: any[];
}

const mockDataSets: Record<string, any[]> = {
  'This Month': [
    { name: 'Week 1', assigned: 120000, collected: 80000 },
    { name: 'Week 2', assigned: 150000, collected: 130000 },
    { name: 'Week 3', assigned: 100000, collected: 60000 },
    { name: 'Week 4', assigned: 180000, collected: 175000 },
  ],
  'Last Month': [
    { name: 'Week 1', assigned: 110000, collected: 90000 },
    { name: 'Week 2', assigned: 140000, collected: 135000 },
    { name: 'Week 3', assigned: 160000, collected: 150000 },
    { name: 'Week 4', assigned: 120000, collected: 110000 },
  ],
  'Last 6 Months': [
    { name: 'Feb', assigned: 300000, collected: 298000 },
    { name: 'Mar', assigned: 450000, collected: 398000 },
    { name: 'Apr', assigned: 278000, collected: 390800 },
    { name: 'May', assigned: 589000, collected: 480000 },
    { name: 'Jun', assigned: 439000, collected: 380000 },
    { name: 'Jul', assigned: 549000, collected: 530000 },
  ],
  'This Year': [
    { name: 'Jan', assigned: 400000, collected: 240000 },
    { name: 'Feb', assigned: 300000, collected: 298000 },
    { name: 'Mar', assigned: 450000, collected: 398000 },
    { name: 'Apr', assigned: 278000, collected: 390800 },
    { name: 'May', assigned: 589000, collected: 480000 },
    { name: 'Jun', assigned: 439000, collected: 380000 },
    { name: 'Jul', assigned: 549000, collected: 530000 },
    { name: 'Aug', assigned: 0, collected: 0 },
    { name: 'Sep', assigned: 0, collected: 0 },
    { name: 'Oct', assigned: 0, collected: 0 },
    { name: 'Nov', assigned: 0, collected: 0 },
    { name: 'Dec', assigned: 0, collected: 0 },
  ],
  'Last Year': [
    { name: 'Jan', assigned: 350000, collected: 320000 },
    { name: 'Feb', assigned: 280000, collected: 250000 },
    { name: 'Mar', assigned: 420000, collected: 400000 },
    { name: 'Apr', assigned: 250000, collected: 230000 },
    { name: 'May', assigned: 500000, collected: 480000 },
    { name: 'Jun', assigned: 400000, collected: 380000 },
    { name: 'Jul', assigned: 480000, collected: 450000 },
    { name: 'Aug', assigned: 380000, collected: 370000 },
    { name: 'Sep', assigned: 410000, collected: 390000 },
    { name: 'Oct', assigned: 320000, collected: 310000 },
    { name: 'Nov', assigned: 290000, collected: 270000 },
    { name: 'Dec', assigned: 450000, collected: 430000 },
  ]
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl">
        <p className="text-slate-300 text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 mt-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">₹{entry.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export const FeeAnalyticsCharts: React.FC<FeeAnalyticsChartsProps> = ({ trendData }) => {
  const [timeframe, setTimeframe] = useState('This Year');
  
  const data = useMemo(() => {
    if (trendData && trendData.length > 0) return trendData;
    return mockDataSets[timeframe] || mockDataSets['This Year'];
  }, [timeframe, trendData]);

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden relative group">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />

      {/* Header */}
      <CardHeader className="pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
        <div>
          <CardTitle className="flex items-center gap-2 text-h4">
            <TrendingUp className="h-5 w-5 text-primary" />
            Collection Trends
          </CardTitle>
          <p className="text-caption mt-1">Assigned vs Collected Revenue</p>
        </div>
        
        <div className="mt-3 sm:mt-0 relative">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-4 pr-10 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all cursor-pointer hover:border-primary/50"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </CardHeader>

      {/* Chart */}
      <CardContent className="flex-1 w-full min-h-[220px] relative z-10 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
              tickFormatter={(value) => `₹${(value / 1000)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Area 
              type="monotone" 
              name="Assigned"
              dataKey="assigned" 
              stroke="#6366f1" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorAssigned)" 
            />
            <Area 
              type="monotone" 
              name="Collected"
              dataKey="collected" 
              stroke="#10b981" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorCollected)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
