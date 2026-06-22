import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Building2, TrendingUp, AlertTriangle, IndianRupee } from 'lucide-react';

const revenueTrends = [
  { month: 'Jan', revenue: 120000 },
  { month: 'Feb', revenue: 150000 },
  { month: 'Mar', revenue: 180000 },
  { month: 'Apr', revenue: 210000 },
  { month: 'May', revenue: 250000 },
];

const schoolRankings = [
  { name: 'Delhi Public School', score: 95 },
  { name: 'St. Xavier High', score: 88 },
  { name: 'Global Academy', score: 82 },
  { name: 'Sunrise Valley', score: 75 },
  { name: 'Apex International', score: 65 },
];

export const SuperAdminIntelligence: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Platform Intelligence</h1>
        <p className="text-slate-500">Cross-school macro-analytics, revenue trends, and churn risk detection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Schools</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-800">142</h2>
            <span className="flex items-center text-emerald-500 text-sm font-bold mb-1">
              <TrendingUp className="w-4 h-4 mr-1" /> +5 this month
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Monthly Recurring Revenue (MRR)</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-indigo-600 flex items-center">
              <IndianRupee className="w-8 h-8" /> 2.5L
            </h2>
            <span className="flex items-center text-emerald-500 text-sm font-bold mb-1">
              <TrendingUp className="w-4 h-4 mr-1" /> +18%
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <p className="text-red-100 font-semibold uppercase tracking-wider mb-1 text-sm">High Churn Risk</p>
            <AlertTriangle className="w-6 h-6 text-red-200" />
          </div>
          <h2 className="text-4xl font-black mt-2">3</h2>
          <p className="text-sm text-red-100 mt-2">Schools requiring retention intervention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Growth Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Performing Schools (Health Score)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolRankings} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminIntelligence;
