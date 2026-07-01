import React from 'react';
import { useAuth } from '../../../../auth/authContext';
import { TrendingUp, TrendingDown, Users, CheckCircle2 } from 'lucide-react';

export const AttendanceExecutiveHero: React.FC<any> = ({ stats }) => {
  const { user, tenantSubdomain } = useAuth();
  
  const currentRate = stats?.students?.rate || 0;
  const yesterdayRate = stats?.trend?.[stats?.trend?.length - 2]?.rate || 0;
  const isUp = currentRate >= yesterdayRate;
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[80px]"></div>
      
      <div className="relative flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Today's Overview, {user?.firstName}
        </h1>
        <p className="text-slate-300 text-sm flex gap-2 items-center">
          <span>{currentDate}</span>
          <span>•</span>
          <span className="font-semibold text-white capitalize">{tenantSubdomain || 'EduXeno'} Campus</span>
        </p>
      </div>

      <div className="relative grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-slate-300 text-xs mb-1">Overall Attendance</div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            {stats?.students?.rate?.toFixed(1) || 0}%
            {isUp ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-slate-300 text-xs mb-1">Students Present</div>
          <div className="text-2xl font-bold text-emerald-400">{stats?.students?.present?.toLocaleString() || 0}</div>
          <div className="text-xs text-slate-400 mt-1">Out of {stats?.students?.total?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-slate-300 text-xs mb-1">Students Absent</div>
          <div className="text-2xl font-bold text-amber-400">{stats?.students?.absent?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="text-slate-300 text-xs mb-1">Teachers Present</div>
          <div className="text-2xl font-bold text-blue-400">{stats?.teachers?.present?.toLocaleString() || 0}</div>
          <div className="text-xs text-slate-400 mt-1">Out of {stats?.teachers?.total?.toLocaleString() || 0}</div>
        </div>
      </div>
    </div>
  );
};
