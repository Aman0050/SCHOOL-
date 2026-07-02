import React from 'react';
import { BookOpen, Award, TrendingUp, AlertTriangle } from 'lucide-react';

interface StudentAcademicsTabProps {
  student: any;
}

export const StudentAcademicsTab: React.FC<StudentAcademicsTabProps> = ({ student }) => {
  const { examMarks = [], examResults = [] } = student;

  if (examResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center">
          <BookOpen className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No Academic Records Found</p>
        <p className="text-sm mt-2">Exam results and performance metrics will appear here once published.</p>
      </div>
    );
  }

  // Get the latest result
  const latestResult = examResults[0];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Metrics Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-md transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium">Average Score</p>
              <h3 className="text-2xl font-bold">{latestResult?.percentage}%</h3>
            </div>
          </div>
          <div className="w-full bg-indigo-400/30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${latestResult?.percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className={`p-4 rounded-xl ${latestResult?.isPassed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}>
            <Award className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Latest Grade</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{latestResult?.grade}</h3>
              <span className={`text-sm font-semibold ${latestResult?.isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                {latestResult?.isPassed ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-500 dark:bg-orange-500/10 rounded-xl">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Exams Taken</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{examResults.length}</h3>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Subject Performance ({latestResult?.exam?.name})</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto w-full">
<table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Marks Obtained</th>
                <th className="px-6 py-4 font-semibold">Max Marks</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {examMarks.map((mark: any) => {
                const percentage = (mark.totalMarks / mark.subject.theoryMaxMarks) * 100;
                const isPassed = mark.totalMarks >= mark.subject.theoryPassMarks;
                return (
                  <tr key={mark.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                      {mark.subject.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {mark.totalMarks}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {mark.subject.theoryMaxMarks}
                    </td>
                    <td className="px-6 py-4 w-64">
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${isPassed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                        {isPassed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
</div>
        </div>
      </div>
    </div>
  );
};
