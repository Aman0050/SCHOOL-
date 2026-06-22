import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Calendar, 
  BookOpen, 
  FileText, 
  PieChart, 
  Activity 
} from 'lucide-react';
import { AcademicExecutiveDashboard } from './components/AcademicExecutiveDashboard';
import { TimetableIntelligence } from './components/TimetableIntelligence';
import { SubjectClassManagement } from './components/SubjectClassManagement';
import { CurriculumManagement } from './components/CurriculumManagement';

export const AcademicManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'classes' | 'timetable' | 'curriculum' | 'reports'>('dashboard');

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
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-xl transition-all ${
            activeTab === 'dashboard'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800/50'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Executive Dashboard
        </button>
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
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-xl transition-all ${
            activeTab === 'reports'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800/50'
          }`}
        >
          <PieChart className="h-4 w-4" />
          Enterprise Analytics & Reports
        </button>
      </div>

      {/* Content Rendering */}
      <div className="pt-2">
        {activeTab === 'dashboard' && <AcademicExecutiveDashboard />}
        
        {activeTab === 'timetable' && (
          // Just pass a hardcoded classId for demonstration. In a real system, you'd add a class selector here.
          <TimetableIntelligence classId="demo-class-id" />
        )}
        
        {activeTab === 'classes' && <SubjectClassManagement />}

        {activeTab === 'curriculum' && <CurriculumManagement />}

        {activeTab === 'reports' && (
          <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Enterprise Academic Reports</h3>
            <p>Generate automated PDFs, subject performance matrices, and workload scores.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicManagement;
