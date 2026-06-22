import React from 'react';
import { useAuth } from '../../../../auth/authContext';
import { Users, UserPlus, UserMinus, GraduationCap, TrendingUp } from 'lucide-react';

export const StudentExecutiveHero: React.FC<any> = ({ stats }) => {
  const { user, tenantSubdomain } = useAuth();
  
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-indigo-900 p-6 text-white shadow-lg flex flex-col lg:flex-row justify-between lg:items-center gap-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px]"></div>
      
      <div className="relative flex flex-col gap-3 max-w-sm">
        <div className="inline-flex w-max items-center gap-1.5 rounded-full bg-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-700">
          <Users className="h-3 w-3" />
          Enterprise Student Information System
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Student Intelligence, {user?.firstName}
        </h1>
      </div>

      <div className="relative grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 w-full lg:w-auto">
        <div className="bg-white/10 rounded-xl p-3 lg:p-4 backdrop-blur-sm border border-white/5 flex flex-col justify-center">
          <div className="text-indigo-200 text-xs mb-1">Total Enrolled Students</div>
          <div className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            {stats?.totalStudents?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 lg:p-4 backdrop-blur-sm border border-white/5 flex flex-col justify-center">
          <div className="text-indigo-200 text-xs mb-1 flex items-center gap-1"><UserPlus className="h-3 w-3"/> New Admissions</div>
          <div className="text-xl lg:text-2xl font-bold text-emerald-400">{stats?.newAdmissions?.toLocaleString() || 0}</div>
          <div className="text-[10px] lg:text-xs text-indigo-300 mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> This Month</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 lg:p-4 backdrop-blur-sm border border-white/5 flex flex-col justify-center">
          <div className="text-indigo-200 text-xs mb-1 flex items-center gap-1"><UserMinus className="h-3 w-3"/> Inactive / Dropouts</div>
          <div className="text-xl lg:text-2xl font-bold text-amber-400">{stats?.inactiveStudents?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 lg:p-4 backdrop-blur-sm border border-white/5 flex flex-col justify-center">
          <div className="text-indigo-200 text-xs mb-1 flex items-center gap-1"><GraduationCap className="h-3 w-3"/> Graduated</div>
          <div className="text-xl lg:text-2xl font-bold text-blue-400">{stats?.graduatedStudents?.toLocaleString() || 0}</div>
        </div>
      </div>
    </div>
  );
};
