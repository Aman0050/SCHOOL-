import React from 'react';
import { AlertTriangle } from 'lucide-react';

const mockRiskData = [
  { id: '1', name: 'James Wilson', grade: 'Grade 10', reason: 'Low Attendance (65%)', level: 'High' },
  { id: '2', name: 'Sarah Connor', grade: 'Grade 8', reason: 'Failing Math & Science', level: 'Medium' },
  { id: '3', name: 'Michael Chang', grade: 'Grade 12', reason: 'Multiple Disciplinary Actions', level: 'High' }
];

export const StudentRiskMonitor: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Risk Monitor
      </h3>
      <div className="flex-1 w-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {mockRiskData.map((student) => (
          <div key={student.id} className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.name}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{student.reason}</p>
            </div>
            <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${
              student.level === 'High' 
                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' 
                : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
            }`}>
              {student.level} Risk
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
