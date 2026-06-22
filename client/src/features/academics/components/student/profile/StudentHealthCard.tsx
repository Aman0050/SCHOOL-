import React from 'react';
import { ShieldAlert, TrendingUp, DollarSign, CalendarCheck } from 'lucide-react';

export const StudentHealthCard: React.FC<any> = ({ student }) => {
  // Compute health score based on mock intelligence logic
  let score = 'Good';
  let color = 'bg-blue-500 text-white';
  
  const attendanceRate = student?.attendanceRecords?.length ? 
    (student.attendanceRecords.filter((a: any) => a.status === 'PRESENT').length / student.attendanceRecords.length) * 100 
    : 100;

  if (attendanceRate < 75) {
    score = 'Critical';
    color = 'bg-red-500 text-white';
  } else if (attendanceRate < 85) {
    score = 'Warning';
    color = 'bg-amber-500 text-white';
  } else if (attendanceRate > 95) {
    score = 'Excellent';
    color = 'bg-emerald-500 text-white';
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
      <div className={`w-full py-2 rounded-lg text-center font-bold uppercase tracking-wider text-sm mb-6 ${color}`}>
        {score} Profile
      </div>
      
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
          <span className="text-slate-500 flex items-center gap-2"><CalendarCheck className="h-4 w-4"/> Attendance</span>
          <span className="font-semibold text-slate-800 dark:text-white">{attendanceRate.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
          <span className="text-slate-500 flex items-center gap-2"><DollarSign className="h-4 w-4"/> Fee Due</span>
          <span className="font-semibold text-slate-800 dark:text-white">$0.00</span>
        </div>
        <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
          <span className="text-slate-500 flex items-center gap-2"><TrendingUp className="h-4 w-4"/> Academics</span>
          <span className="font-semibold text-slate-800 dark:text-white">A- (89%)</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 flex items-center gap-2"><ShieldAlert className="h-4 w-4"/> Behavior</span>
          <span className="font-semibold text-slate-800 dark:text-white">No Incidents</span>
        </div>
      </div>
    </div>
  );
};
