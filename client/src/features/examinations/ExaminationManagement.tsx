import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ClipboardList, BookOpen, Calculator, BarChart3, Settings, 
  Calendar, CheckCircle, Clock, FileText, Plus, Loader2 
} from 'lucide-react';
import { examApi } from './api/examApi';
import { ExamSetup } from './components/ExamSetup';
import { MarksEntryUI } from './components/MarksEntryUI';
import { ExamsTab } from './components/ExamsTab';
import { ResultsReportsTab } from './components/ResultsReportsTab';
import { PageSkeleton } from '../../components/ui/skeletons/PageSkeleton';

export const ExaminationManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'dashboard';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'setup' | 'exams' | 'marks' | 'results'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab as any);
  }, [searchParams]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['examStats'],
    queryFn: () => examApi.getDashboardStats(),
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examApi.getExams(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Examination Center</h1>
          <p className="text-sm text-slate-500 mt-1">Manage academic sessions, exams, marks, and report cards.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart3 },
          { id: 'setup', label: 'Setup', icon: Settings },
          { id: 'exams', label: 'Exams', icon: Calendar },
          { id: 'marks', label: 'Marks Entry', icon: ClipboardList },
          { id: 'results', label: 'Results & Reports', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && (
          statsLoading ? <PageSkeleton /> : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Exams', value: stats?.totalExams || 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Published Results', value: stats?.publishedExams || 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Pending Marks', value: stats?.pendingMarks || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { label: 'Total Report Cards', value: stats?.totalResults || 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : stat.value}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 dark:text-white">Recent Exams</h3>
                <button onClick={() => setActiveTab('exams')} className="text-xs text-primary hover:underline font-medium">
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3">Exam Name</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {examsLoading ? (
                      <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                    ) : exams?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                          No exams found —{' '}
                          <button onClick={() => setActiveTab('exams')} className="text-primary hover:underline">
                            Create your first exam
                          </button>
                        </td>
                      </tr>
                    ) : (
                      exams?.slice(0, 5).map((exam: any) => (
                        <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{exam.name}</td>
                          <td className="px-5 py-4 text-slate-500">{exam.examType.replace('_', ' ')}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                              exam.status === 'COMPLETED' ? 'bg-primary/10 text-primary' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {exam.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500">{new Date(exam.startDate).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )
        )}

        {activeTab === 'exams' && <ExamsTab />}
        {activeTab === 'marks' && <MarksEntryUI />}
        {activeTab === 'results' && <ResultsReportsTab />}
        {activeTab === 'setup' && <ExamSetup />}
      </div>
    </div>
  );
};
