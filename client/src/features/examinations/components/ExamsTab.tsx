import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus, X, Save, Loader2, Calendar, ChevronRight,
  Clock, CheckCircle2, FileEdit, Eye, Send
} from 'lucide-react';
import { examApi } from '../api/examApi';
import type { Exam } from '../types/exam.types';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  SCHEDULED: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  ONGOING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  COMPLETED: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const examSchema = z.object({
  name: z.string().min(2, 'Exam name is required'),
  examType: z.enum(['UNIT_TEST', 'MONTHLY_TEST', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'PRE_BOARD', 'BOARD', 'PRACTICAL', 'VIVA', 'INTERNAL']),
  classId: z.string().min(1, 'Class is required'),
  sessionId: z.string().min(1, 'Session is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  boardType: z.enum(['CBSE', 'ICSE', 'STATE_BOARD', 'INTERNATIONAL', 'CUSTOM']),
  gradeSystem: z.enum(['PERCENTAGE', 'GRADE', 'GPA', 'CGPA', 'CUSTOM']),
  weightage: z.coerce.number().min(0).max(100),
  passingCriteria: z.coerce.number().min(0).max(100),
  remarks: z.string().optional(),
});

export const ExamsTab: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(() => searchParams.get('action') === 'new');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams', statusFilter],
    queryFn: () => examApi.getExams(statusFilter ? { status: statusFilter } : undefined),
    staleTime: 60 * 1000,
  });

  const { data: sessions } = useQuery({
    queryKey: ['academicSessions'],
    queryFn: () => examApi.getSessions(),
  });

  const { data: classes } = useQuery({
    queryKey: ['classesBasic'],
    queryFn: () => import('../../../lib/api').then(m => m.default.get('/academics/classes').then(r => r.data.data)),
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof examSchema>) => examApi.createExam(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['examStats'] });
      toast.success('Exam created successfully');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to create exam'),
  });

  const publishMutation = useMutation({
    mutationFn: (examId: string) => examApi.publishExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Results published successfully');
    },
    onError: () => toast.error('Failed to publish results'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      examType: 'UNIT_TEST',
      boardType: 'CBSE',
      gradeSystem: 'PERCENTAGE',
      weightage: 100,
      passingCriteria: 33,
    },
  });

  const onSubmit = (data: z.infer<typeof examSchema>) => createMutation.mutate(data);

  const STATUSES = ['', 'DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'PUBLISHED'];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <button
          onClick={() => { reset(); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {/* Exams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : exams?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No exams found</p>
          <p className="text-sm text-slate-400 mt-1">Create your first exam to get started</p>
          <button
            onClick={() => { reset(); setShowModal(true); }}
            className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams?.map((exam: Exam) => (
            <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-indigo-800 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">{exam.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{exam.class?.name}{exam.class?.section ? ` — ${exam.class.section}` : ''}</p>
                </div>
                <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${STATUS_COLORS[exam.status] || STATUS_COLORS.DRAFT}`}>
                  {exam.status}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(exam.startDate).toLocaleDateString()} — {new Date(exam.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{exam.examType.replace(/_/g, ' ')}</span>
                  <span>{exam.boardType}</span>
                  <span>{exam.gradeSystem}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-3 text-xs text-slate-500">
                  <span><strong className="text-slate-800 dark:text-white">{exam._count?.marksEntries || 0}</strong> marks</span>
                  <span><strong className="text-slate-800 dark:text-white">{exam._count?.studentResults || 0}</strong> results</span>
                </div>
                {exam.status === 'COMPLETED' && (
                  <button
                    onClick={() => publishMutation.mutate(exam.id)}
                    disabled={publishMutation.isPending}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {publishMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Exam</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Name *</label>
                  <input {...register('name')} placeholder="e.g. Mid-Term Examination 2025" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Session *</label>
                  <select {...register('sessionId')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                    <option value="">Select Session</option>
                    {sessions?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.sessionId && <p className="text-red-500 text-xs mt-1">{errors.sessionId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class *</label>
                  <select {...register('classId')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                    <option value="">Select Class</option>
                    {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>)}
                  </select>
                  {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Type *</label>
                  <select {...register('examType')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                    {['UNIT_TEST','MONTHLY_TEST','QUARTERLY','HALF_YEARLY','ANNUAL','PRE_BOARD','BOARD','PRACTICAL','VIVA','INTERNAL'].map(t => (
                      <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Board Type</label>
                  <select {...register('boardType')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                    {['CBSE','ICSE','STATE_BOARD','INTERNATIONAL','CUSTOM'].map(b => <option key={b} value={b}>{b.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grade System</label>
                  <select {...register('gradeSystem')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                    {['PERCENTAGE','GRADE','GPA','CGPA','CUSTOM'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input type="date" {...register('startDate')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                  <input type="date" {...register('endDate')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weightage (%)</label>
                  <input type="number" {...register('weightage')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Passing Criteria (%)</label>
                  <input type="number" {...register('passingCriteria')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks (Optional)</label>
                  <textarea {...register('remarks')} rows={2} placeholder="Any special instructions..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
