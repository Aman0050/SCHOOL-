import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { BookOpen, Loader2, Plus, Filter, FileText } from 'lucide-react';
import { useAuth } from '../../auth/authContext';
import { CreateLessonPlanModal } from './CreateLessonPlanModal';

export const CurriculumManagement: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: lessonPlans, isLoading } = useQuery({
    queryKey: ['lesson-plans'],
    queryFn: () => api.get('/curriculum/lesson-plans').then(res => res.data.data),
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Curriculum & Lesson Planning</h2>
            <p className="text-sm text-slate-500">Track and manage syllabi and individual lesson plans.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonPlans?.length ? (
          lessonPlans.map((plan: any) => (
            <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  plan.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  plan.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {plan.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {new Date(plan.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{plan.title}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{plan.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {plan.subject?.name} • {plan.class?.name}
                </div>
                <button className="text-primary hover:text-primary/80 text-sm font-semibold">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Lesson Plans Yet</h3>
            <p>Create your first lesson plan to start tracking syllabus progress.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors"
            >
              Create Plan
            </button>
          </div>
        )}
      </div>
      
      <CreateLessonPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isAdmin={user?.role === 'SCHOOL_ADMIN'} 
      />
    </div>
  );
};
