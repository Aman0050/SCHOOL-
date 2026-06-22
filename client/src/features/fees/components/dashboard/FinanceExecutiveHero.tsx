import React from 'react';
import { useAuth } from '../../../auth/authContext';
import { IndianRupee, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

export const FinanceExecutiveHero: React.FC<any> = ({ stats }) => {
  const { user, tenantSubdomain } = useAuth();
  
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-indigo-900 p-6 text-white shadow-lg flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px]"></div>
      
      <div className="relative flex flex-col gap-4">
        <div className="inline-flex w-max items-center gap-1.5 rounded-full bg-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-700">
          <Sparkles className="h-3 w-3" />
          Finance Command Center
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Overview, {user?.firstName}
        </h1>
        <p className="text-indigo-200 text-sm">
          <span className="font-semibold text-white capitalize">{tenantSubdomain} High School</span>
        </p>
      </div>

      <div className="relative grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-indigo-200 text-xs mb-1">Total Assigned</div>
          <div className="text-2xl font-bold text-white">₹{stats?.totalAssigned?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-indigo-200 text-xs mb-1">Total Collected</div>
          <div className="text-2xl font-bold text-emerald-400">₹{stats?.totalCollected?.toLocaleString() || 0}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> {stats?.collectionRate}% Rate
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-indigo-200 text-xs mb-1">Pending Collection</div>
          <div className="text-2xl font-bold text-amber-400">₹{stats?.pendingCollection?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 backdrop-blur-sm border border-red-500/20 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <div className="text-red-300 text-xs font-semibold mb-1">Overdue Amount</div>
            <div className="text-xl font-bold text-white">₹{stats?.overdueCollection?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
