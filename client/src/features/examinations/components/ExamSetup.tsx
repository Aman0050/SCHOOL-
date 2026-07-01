import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Plus, Loader2, Save, X, Calendar, BookOpen } from 'lucide-react';
import { examApi } from '../api/examApi';
import type {  AcademicSession, ExamTerm, ExamSubject  } from '../types/exam.types';

// Zod schemas
const sessionSchema = z.object({
  name: z.string().min(2, "Session name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const termSchema = z.object({
  sessionId: z.string().uuid(),
  name: z.string().min(2, "Term name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  weightagePercent: z.coerce.number().min(0).max(100),
});

const subjectSchema = z.object({
  code: z.string().min(2, "Code is required"),
  name: z.string().min(2, "Name is required"),
  subjectType: z.enum(['THEORY', 'PRACTICAL', 'BOTH', 'VIVA']),
  theoryMaxMarks: z.coerce.number().min(0),
  practicalMaxMarks: z.coerce.number().min(0),
  theoryPassMarks: z.coerce.number().min(0),
  practicalPassMarks: z.coerce.number().min(0),
  boardType: z.enum(['CBSE', 'ICSE', 'STATE_BOARD', 'INTERNATIONAL', 'CUSTOM']),
});

export const ExamSetup: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'terms' | 'subjects'>('sessions');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => fetch('/api/schools').then(res => res.json()).then(d => d.data),
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['academicSessions'],
    queryFn: () => examApi.getSessions(),
  });

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['examTerms'],
    queryFn: () => examApi.getTerms(),
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['examSubjects'],
    queryFn: () => examApi.getSubjects(),
  });

  const sessionMutation = useMutation({
    mutationFn: (data: z.infer<typeof sessionSchema>) => examApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSessions'] });
      setShowModal(false);
    }
  });

  const termMutation = useMutation({
    mutationFn: (data: z.infer<typeof termSchema>) => examApi.createTerm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examTerms'] });
      setShowModal(false);
    }
  });

  const subjectMutation = useMutation({
    mutationFn: (data: z.infer<typeof subjectSchema>) => examApi.createSubject(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSubjects'] });
      setShowModal(false);
    }
  });

  const handleCreate = (data: any) => {
    if (activeSubTab === 'sessions') sessionMutation.mutate(data);
    else if (activeSubTab === 'terms') termMutation.mutate(data);
    else if (activeSubTab === 'subjects') subjectMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveSubTab('sessions')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeSubTab === 'sessions' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Academic Sessions</button>
        <button onClick={() => setActiveSubTab('terms')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeSubTab === 'terms' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Exam Terms</button>
        <button onClick={() => setActiveSubTab('subjects')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeSubTab === 'subjects' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Exam Subjects</button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{activeSubTab.replace('_', ' ')}</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Tables */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
          <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800">
            {activeSubTab === 'sessions' && (
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">School</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Status</th></tr>
            )}
            {activeSubTab === 'terms' && (
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Session</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Weightage</th></tr>
            )}
            {activeSubTab === 'subjects' && (
              <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Max Marks (Th/Pr)</th><th className="px-5 py-3">Board</th></tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeSubTab === 'sessions' && sessionsLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>}
            {activeSubTab === 'sessions' && sessions?.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{s.name}</td>
                <td className="px-5 py-4 text-slate-500">{s.school?.name || 'N/A'}</td>
                <td className="px-5 py-4 text-slate-500">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded-md text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
            
            {activeSubTab === 'terms' && termsLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>}
            {activeSubTab === 'terms' && terms?.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{t.name}</td>
                <td className="px-5 py-4 text-slate-500">{t.session?.name}</td>
                <td className="px-5 py-4 text-slate-500">{new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-slate-500">{t.weightagePercent}%</td>
              </tr>
            ))}

            {activeSubTab === 'subjects' && subjectsLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>}
            {activeSubTab === 'subjects' && subjects?.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{s.code}</td>
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{s.name}</td>
                <td className="px-5 py-4 text-slate-500">{s.subjectType}</td>
                <td className="px-5 py-4 text-slate-500">{s.theoryMaxMarks} / {s.practicalMaxMarks}</td>
                <td className="px-5 py-4 text-slate-500"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{s.boardType}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal with React Hook Form */}
      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" role="dialog">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add New {activeSubTab === 'sessions' ? 'Academic Session' : activeSubTab === 'terms' ? 'Exam Term' : 'Exam Subject'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <DynamicForm 
                type={activeSubTab} 
                onClose={() => setShowModal(false)} 
                onSubmit={handleCreate}
                sessions={sessions}
                schools={schools}
                isSubmitting={sessionMutation.isPending || termMutation.isPending || subjectMutation.isPending}
              />
           </div>
         </div>
      )}
    </div>
  );
};

// Dynamic Form Component separated for clarity
const DynamicForm = ({ type, onClose, onSubmit, sessions, schools, isSubmitting }: any) => {
  const schema = type === 'sessions' ? sessionSchema : type === 'terms' ? termSchema : subjectSchema;
  
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      subjectType: 'THEORY',
      boardType: 'CBSE',
      theoryMaxMarks: 100,
      practicalMaxMarks: 0,
      theoryPassMarks: 33,
      practicalPassMarks: 0,
      weightagePercent: 100
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {type === 'sessions' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Session Name</label>
              <input {...register('name')} placeholder="e.g. 2025-2026" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input type="date" {...register('startDate')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input type="date" {...register('endDate')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message as string}</p>}
            </div>
          </div>
        </>
      )}

      {type === 'terms' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Session</label>
              <select {...register('sessionId')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Select Session</option>
                {sessions?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.sessionId && <p className="text-red-500 text-xs mt-1">{errors.sessionId.message as string}</p>}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Term Name</label>
              <input {...register('name')} placeholder="e.g. Mid-Term Examination" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input type="date" {...register('startDate')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input type="date" {...register('endDate')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weightage (%)</label>
              <input type="number" {...register('weightagePercent')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </>
      )}

      {type === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
            <input {...register('code')} placeholder="e.g. MAT101" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
            <input {...register('name')} placeholder="e.g. Mathematics" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Type</label>
            <select {...register('subjectType')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none">
              <option value="THEORY">Theory</option>
              <option value="PRACTICAL">Practical</option>
              <option value="BOTH">Theory & Practical</option>
              <option value="VIVA">Viva/Oral</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Board Type</label>
            <select {...register('boardType')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none">
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="STATE_BOARD">State Board</option>
              <option value="INTERNATIONAL">International</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theory Max Marks</label>
            <input type="number" {...register('theoryMaxMarks')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theory Pass Marks</label>
            <input type="number" {...register('theoryPassMarks')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Practical Max Marks</label>
            <input type="number" {...register('practicalMaxMarks')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Practical Pass Marks</label>
            <input type="number" {...register('practicalPassMarks')} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
         <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
         <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
           {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Save Details
         </button>
      </div>
    </form>
  );
};
