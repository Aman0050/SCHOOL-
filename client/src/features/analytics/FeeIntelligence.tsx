import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';
import { IndianRupee, TrendingUp, AlertOctagon } from 'lucide-react';

const collectionData = [
  { month: 'Apr', target: 500000, collected: 480000 },
  { month: 'May', target: 500000, collected: 450000 },
  { month: 'Jun', target: 500000, collected: 490000 },
  { month: 'Jul', target: 500000, collected: 410000 },
  { month: 'Aug', target: 500000, collected: 300000 }, // Current month, projected
];

export const FeeIntelligence: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Fee Intelligence</h1>
        <p className="text-slate-500">Revenue forecasting, collection metrics, and defaulter intelligence.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-emerald-100 font-semibold uppercase tracking-wider mb-1 text-sm">Total Collected</p>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-8 h-8 opacity-80" />
            <h2 className="text-4xl font-black">18.5L</h2>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-400/50 flex justify-between text-sm">
            <span>Target: ₹25L</span>
            <span className="font-bold">74% Achieved</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Outstanding Amount</p>
          <h2 className="text-4xl font-black text-red-600">₹6.5L</h2>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
            <AlertOctagon className="w-4 h-4 text-amber-500" />
            <span>42 High-Risk Defaulters</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Forecast (Next Month)</p>
          <h2 className="text-4xl font-black text-indigo-600">₹4.2L</h2>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>85% Confidence Score</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Collection vs Target</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                formatter={(value: number) => `₹${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Line type="monotone" dataKey="target" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default FeeIntelligence;
