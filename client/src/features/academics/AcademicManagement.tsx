import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { 
  LayoutDashboard, 
  Layers, 
  Calendar, 
  BookOpen, 
  FileText, 
  PieChart, 
  Activity 
} from 'lucide-react';
import { TimetableIntelligence } from './components/TimetableIntelligence';
import { SubjectClassManagement } from './components/SubjectClassManagement';
import { CurriculumManagement } from './components/CurriculumManagement';

export const AcademicManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) === 'dashboard' || !searchParams.get('tab') ? 'classes' : searchParams.get('tab') as any;
  const [activeTab, setActiveTab] = useState<'classes' | 'timetable' | 'curriculum'>(initialTab === 'reports' ? 'classes' : initialTab);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab as any);
  }, [searchParams]);

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academics/classes').then(res => res.data.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Academic Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise operations for curriculum, timetables, and academic health.</p>
        </div>
      </div>

      {/* Enterprise Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-2 pb-px no-scrollbar">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-xl transition-all ${
            activeTab === 'classes'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800/50'
          }`}
        >
          <Layers className="h-4 w-4" />
          Subject & Class Management
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-xl transition-all ${
            activeTab === 'timetable'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800/50'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Timetable Intelligence
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-xl transition-all ${
            activeTab === 'curriculum'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Curriculum & Lesson Plans
        </button>
      </div>

      {/* Content Rendering */}
      <div className="pt-2">
        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Select Class Context:</label>
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <option value="">-- Choose Class --</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.section ? `(${c.section})` : ''}</option>
                ))}
              </select>
            </div>
            <TimetableIntelligence classId={selectedClassId || undefined} />
          </div>
        )}
        
        {activeTab === 'classes' && <SubjectClassManagement />}

        {activeTab === 'curriculum' && <CurriculumManagement />}
      </div>
    </div>
  );
};

export default AcademicManagement;
