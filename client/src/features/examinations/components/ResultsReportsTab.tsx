import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy, Medal, BarChart3, FileText, Download,
  CheckCircle2, XCircle, Loader2, Search, Play
} from 'lucide-react';
import { examApi } from '../api/examApi';
import type { StudentResult, StudentRanking } from '../types/exam.types';
import toast from 'react-hot-toast';

export const ResultsReportsTab: React.FC = () => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [activeView, setActiveView] = useState<'results' | 'rankings'>('results');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examApi.getExams(),
    staleTime: 60 * 1000,
  });

  const availableExams = exams?.filter(e => e.status !== 'CANCELLED') || [];

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['examResults', selectedExamId],
    queryFn: () => examApi.getResults(selectedExamId),
    enabled: !!selectedExamId,
    staleTime: 60 * 1000,
  });

  const { data: rankings, isLoading: rankingsLoading } = useQuery({
    queryKey: ['examRankings', selectedExamId],
    queryFn: () => examApi.getRankings(selectedExamId),
    enabled: !!selectedExamId && activeView === 'rankings',
    staleTime: 60 * 1000,
  });

  const computeMutation = useMutation({
    mutationFn: () => examApi.computeResults(selectedExamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examResults', selectedExamId] });
      queryClient.invalidateQueries({ queryKey: ['examRankings', selectedExamId] });
      queryClient.invalidateQueries({ queryKey: ['examStats'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Results computed successfully!');
    },
    onError: () => toast.error('Failed to compute results. Ensure all marks are submitted.'),
  });

  const filteredResults = results?.filter((r: StudentResult) => {
    const name = `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const selectedExam = exams?.find(e => e.id === selectedExamId);

  // Summary stats
  const totalStudents = results?.length || 0;
  const passedStudents = results?.filter((r: StudentResult) => r.isPassed).length || 0;
  const failedStudents = totalStudents - passedStudents;
  const avgPercentage = totalStudents > 0
    ? (results?.reduce((sum: number, r: StudentResult) => sum + r.percentage, 0) / totalStudents).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Exam Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Select Exam</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Select an exam to process --</option>
              {examsLoading && <option disabled>Loading...</option>}
              {availableExams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.class?.name} ({e.status})
                </option>
              ))}
            </select>
            {exams && availableExams.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                No exams found.
              </p>
            )}
          </div>
          {selectedExamId && (
            <button
              onClick={() => computeMutation.mutate()}
              disabled={computeMutation.isPending}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50 shadow-sm"
            >
              {computeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {results && results.length > 0 ? 'Recompute Results' : 'Compute Results'}
            </button>
          )}
        </div>
      </div>

      {selectedExamId && results && results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: totalStudents, icon: FileText, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/20' },
              { label: 'Pass', value: passedStudents, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Fail', value: failedStudents, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'Avg Score', value: `${avgPercentage}%`, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View Toggle + Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex gap-2">
              {[
                { id: 'results', label: 'Results', icon: FileText },
                { id: 'rankings', label: 'Rankings', icon: Trophy },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeView === v.id
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <v.icon className="w-4 h-4" />
                  {v.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary w-56"
              />
            </div>
          </div>

          {/* Results Table */}
          {activeView === 'results' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Adm. No</th>
                      <th className="px-5 py-3 text-center">Total Marks</th>
                      <th className="px-5 py-3 text-center">Percentage</th>
                      <th className="px-5 py-3 text-center">Grade</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-center">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {resultsLoading ? (
                      <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                    ) : filteredResults?.map((result: StudentResult) => (
                      <tr key={result.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                          {result.student?.firstName} {result.student?.lastName}
                        </td>
                        <td className="px-5 py-4 text-slate-500">{result.student?.admission?.admissionNumber || '—'}</td>
                        <td className="px-5 py-4 text-center text-slate-700 dark:text-slate-300">
                          {result.totalMarksObtained} / {result.totalMaxMarks}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`font-bold ${result.percentage >= 75 ? 'text-emerald-600' : result.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {result.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-xs font-bold px-2 py-1 rounded-lg">
                            {result.grade || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {result.isAbsent ? (
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">Absent</span>
                          ) : result.isPassed ? (
                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg flex items-center gap-1 justify-center w-max mx-auto">
                              <CheckCircle2 className="w-3 h-3" /> Pass
                            </span>
                          ) : (
                            <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-1 rounded-lg flex items-center gap-1 justify-center w-max mx-auto">
                              <XCircle className="w-3 h-3" /> Fail
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-500 font-mono text-sm">
                          {result.classRank ? `#${result.classRank}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rankings Table */}
          {activeView === 'rankings' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3 text-center">Rank</th>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Adm. No</th>
                      <th className="px-5 py-3 text-center">Percentage</th>
                      <th className="px-5 py-3">Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rankingsLoading ? (
                      <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                    ) : rankings?.filter((r: StudentRanking) => {
                        const name = `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase();
                        return name.includes(searchTerm.toLowerCase());
                      }).map((ranking: StudentRanking, idx: number) => (
                      <tr key={ranking.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${idx < 3 ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                        <td className="px-5 py-4 text-center">
                          {ranking.classRank === 1 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                              <Trophy className="w-4 h-4 text-yellow-600" />
                            </span>
                          ) : ranking.classRank === 2 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-200 rounded-full">
                              <Medal className="w-4 h-4 text-slate-600" />
                            </span>
                          ) : ranking.classRank === 3 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                              <Medal className="w-4 h-4 text-amber-700" />
                            </span>
                          ) : (
                            <span className="font-bold text-slate-500 font-mono">#{ranking.classRank}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                          {ranking.student?.firstName} {ranking.student?.lastName}
                        </td>
                        <td className="px-5 py-4 text-slate-500">{ranking.student?.admission?.admissionNumber || '—'}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`font-bold ${ranking.percentage >= 75 ? 'text-emerald-600' : ranking.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {ranking.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-medium text-slate-600 dark:text-slate-300">
                            {ranking.rankBasis}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {selectedExamId && !resultsLoading && (!results || results.length === 0) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No results computed yet</p>
          <p className="text-sm text-slate-500 mt-1 mb-6">Make sure all marks are submitted, then compute results.</p>
          <button
            onClick={() => computeMutation.mutate()}
            disabled={computeMutation.isPending}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50"
          >
            {computeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Compute Results Now
          </button>
        </div>
      )}

      {!selectedExamId && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">Select an exam above to view results & rankings</p>
        </div>
      )}
    </div>
  );
};
