import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Users, LogIn, MailOpen } from 'lucide-react';

const engagementData = [
  { name: 'Highly Active', value: 45 },
  { name: 'Moderately Active', value: 30 },
  { name: 'Inactive (>30 days)', value: 25 },
];

const loginTrends = [
  { name: 'Week 1', logins: 450 },
  { name: 'Week 2', logins: 480 },
  { name: 'Week 3', logins: 420 },
  { name: 'Week 4', logins: 510 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const ParentEngagement: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Parent Engagement</h1>
        <p className="text-slate-500">Track app usage, fee payment activity, and notice read rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LogIn className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Weekly Active</p>
            <h2 className="text-3xl font-black text-slate-800">510</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MailOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Notice Read Rate</p>
            <h2 className="text-3xl font-black text-slate-800">72%</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-1">Disengaged Parents</p>
            <h2 className="text-3xl font-black text-red-700">125</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Engagement Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Login Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loginTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={3} dot={{r: 6, strokeWidth: 2}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentEngagement;
