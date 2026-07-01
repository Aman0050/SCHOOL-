import React from 'react';
import { useAuth } from '../../../auth/authContext';
import { IndianRupee, TrendingUp, AlertCircle, Sparkles, DownloadCloud } from 'lucide-react';

export const FinanceExecutiveHero: React.FC<any> = ({ stats, onExportClick }) => {
  const { user, tenantSubdomain } = useAuth();
  
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg flex flex-col justify-center gap-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[80px]"></div>
      
      <div className="relative flex justify-between items-start">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-max items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-700">
            <Sparkles className="h-3 w-3" />
            Finance Command Center
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
            Overview, {user?.firstName}
          </h1>
        </div>
        <button 
          onClick={onExportClick}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all text-sm font-semibold shadow-lg shadow-black/10"
        >
          <DownloadCloud className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="relative grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-slate-300 text-xs mb-1">Total Assigned</div>
          <div className="text-2xl font-bold text-white">₹{stats?.totalAssigned?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-slate-300 text-xs mb-1">Total Collected</div>
          <div className="text-2xl font-bold text-emerald-400">₹{stats?.totalCollected?.toLocaleString() || 0}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> {stats?.collectionRate}% Rate
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-slate-300 text-xs mb-1">Pending Collection</div>
          <div className="text-2xl font-bold text-amber-400">₹{stats?.pendingCollection?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5 flex items-center gap-3">
          <div className="bg-destructive/40 p-2 rounded-lg">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-slate-300 text-xs font-semibold mb-1">Overdue Amount</div>
            <div className="text-xl font-bold text-white">₹{stats?.overdueCollection?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
