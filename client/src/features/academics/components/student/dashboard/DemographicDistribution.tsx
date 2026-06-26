import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#ec4899'];

export const DemographicDistribution: React.FC<any> = ({ stats }) => {
  const data = stats?.genderDemographics || [];

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Gender Demographics</h3>
      {data.length === 0 ? (
        <div className="flex-1 w-full flex items-center justify-center text-slate-400 text-sm">
          Insufficient data to generate demographic charts.
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[150px] flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/2 flex flex-col gap-3">
            {data.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{entry.name}</span>
                <span className="text-sm font-bold ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
