import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { ShieldCheck, BookOpen, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const AcademicExecutiveDashboard: React.FC = () => {
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['academic-health'],
    queryFn: () => api.get('/analytics/health').then(res => res.data.data)
  });

  if (healthLoading) return <div className="p-8 text-center animate-pulse text-slate-500">Calculating Academic Health...</div>;

  const score = healthData?.overallScore || 0;
  let scoreColor = 'text-green-500';
  let bgScoreColor = 'bg-green-500';
  if (score < 50) { scoreColor = 'text-red-500'; bgScoreColor = 'bg-red-500'; }
  else if (score < 75) { scoreColor = 'text-amber-500'; bgScoreColor = 'bg-amber-500'; }

  const chartData = [
    { name: 'Attendance', value: healthData?.breakdown?.attendance || 0, color: '#3b82f6' },
    { name: 'Academics', value: healthData?.breakdown?.academics || 0, color: '#8b5cf6' },
    { name: 'Homework', value: healthData?.breakdown?.homework || 0, color: '#10b981' },
    { name: 'Engagement', value: healthData?.breakdown?.engagement || 0, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Health Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Overall Health
          </div>
          
          <div className="relative w-48 h-48 mt-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="12" fill="none" />
              <circle cx="96" cy="96" r="88" className={`stroke-current ${scoreColor} transition-all duration-1000 ease-out`} strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 88}`} strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-extrabold tracking-tighter ${scoreColor}`}>{score}</span>
              <span className="text-sm font-medium text-slate-500">out of 100</span>
            </div>
          </div>
          
          <div className="mt-6 w-full text-center">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white ${bgScoreColor}`}>
              Status: {healthData?.category}
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Health Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 items-center">
            
            {/* Component List */}
            <div className="space-y-4">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>

            {/* Pie Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
          </div>
        </div>

      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Syllabus Completion', val: `${chartData[1].value}%`, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'At-Risk Classes', val: '2', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Teacher Activity', val: 'High', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
          { title: 'Pending Tasks', val: '14', icon: Clock, color: 'text-primary', bg: 'bg-primary/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
