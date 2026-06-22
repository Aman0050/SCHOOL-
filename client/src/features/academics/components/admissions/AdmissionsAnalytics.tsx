import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, CheckCircle2, XCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AdmissionsAnalyticsProps {
  applicants: any[];
}

export const AdmissionsAnalytics: React.FC<AdmissionsAnalyticsProps> = ({ applicants }) => {
  // Compute analytics from applicants data
  const total = applicants.length;
  const approved = applicants.filter(a => a.stage === 'approved' || a.stage === 'enrolled').length;
  const rejected = applicants.filter(a => a.stage === 'rejected').length;
  const conversionRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';

  // Grade Distribution
  const gradeCount = applicants.reduce((acc: any, curr) => {
    acc[curr.grade] = (acc[curr.grade] || 0) + 1;
    return acc;
  }, {});
  const gradeData = Object.keys(gradeCount).map(grade => ({
    name: `Grade ${grade}`,
    applications: gradeCount[grade]
  }));

  // Status Distribution
  const statusData = [
    { name: 'Pending', value: applicants.filter(a => a.stage === 'new-registrations' || a.stage === 'document-verification' || a.stage === 'assessment-interview').length },
    { name: 'Approved', value: approved },
    { name: 'Rejected', value: rejected },
  ];

  // Dummy monthly trend data (in real app, group applicants by createdAt)
  const monthlyData = [
    { month: 'Jan', applications: 12, approved: 4 },
    { month: 'Feb', applications: 19, approved: 8 },
    { month: 'Mar', applications: 25, approved: 12 },
    { month: 'Apr', applications: 32, approved: 20 },
    { month: 'May', applications: 45, approved: 28 },
    { month: 'Jun', applications: Math.max(total, 50), approved: Math.max(approved, 30) },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900">
      
      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Volume</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{total}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversion Rate</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{conversionRate}%</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approved</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{approved}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejected</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{rejected}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Applications Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="applications" name="Applications" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Pipeline Status</h3>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Applications by Grade</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="applications" name="Total Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
