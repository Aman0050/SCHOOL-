import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../auth/authContext';
import { useDashboardLayout } from './store/useDashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Settings2, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { ExecutiveHero } from './components/ExecutiveHero';
import { HealthScore } from './components/HealthScore';
import { Operations } from './components/Operations';
import { CriticalAction } from './components/CriticalAction';
import { AttendanceAnalytics } from './components/AttendanceAnalytics';
import { FeeAnalytics } from './components/FeeAnalytics';
import { AcademicAnalytics } from './components/AcademicAnalytics';
import { StudentIntel } from './components/StudentIntel';
import { TeacherIntel } from './components/TeacherIntel';
import { Communication } from './components/Communication';
import { QuickActions } from './components/QuickActions';
import { RecentActivity } from './components/RecentActivity';
import { UpcomingEvents } from './components/UpcomingEvents';
import { ReportsPanel } from './components/ReportsPanel';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_TITLES: Record<string, string> = {
  executiveHero: 'Executive Summary',
  healthScore: 'School Health Score',
  operations: 'Operations Overview',
  criticalAction: 'Critical Actions',
  attendanceAnalytics: 'Attendance Analytics',
  feeAnalytics: 'Fee Analytics',
  academicAnalytics: 'Academic Analytics',
  studentIntel: 'Student Intelligence',
  teacherIntel: 'Teacher Intelligence',
  communication: 'Communication Hub',
  reportsPanel: 'Reports Engine',
  quickActions: 'Quick Shortcuts',
  recentActivity: 'Recent Activity',
  upcomingEvents: 'Upcoming Events'
};

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { layout, saveLayout, resetLayout, visibleWidgets, toggleWidget } = useDashboardLayout(user?.id || 'default');
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);

  // Fetch Dashboard Analytics
  const { data: attendanceData } = useQuery({
    queryKey: ['analytics', 'attendance'],
    queryFn: () => api.get('/analytics/attendance').then(res => res.data.data),
  });

  const { data: feeData } = useQuery({
    queryKey: ['analytics', 'fees'],
    queryFn: () => api.get('/analytics/fees').then(res => res.data.data),
  });

  const { data: healthData } = useQuery({
    queryKey: ['analytics', 'health'],
    queryFn: () => api.get('/analytics/health').then(res => res.data.data),
  });

  const { data: alertsData } = useQuery({
    queryKey: ['analytics', 'alerts'],
    queryFn: () => api.get('/analytics/alerts').then(res => res.data.data),
  });

  const onLayoutChange = (newLayout: any) => {
    saveLayout(newLayout);
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'executiveHero': return <ExecutiveHero healthScore={healthData?.overallScore || 0} attendanceRate={attendanceData?.students?.rate?.toFixed(1) || 0} feeCollection={feeData?.collection?.percentage || 0} alertsCount={alertsData?.alerts?.length || 0} />;
      case 'healthScore': return <HealthScore />;
      case 'operations': return <Operations />;
      case 'criticalAction': return <CriticalAction />;
      case 'attendanceAnalytics': return <AttendanceAnalytics />;
      case 'feeAnalytics': return <FeeAnalytics />;
      case 'academicAnalytics': return <AcademicAnalytics />;
      case 'studentIntel': return <StudentIntel />;
      case 'teacherIntel': return <TeacherIntel />;
      case 'communication': return <Communication />;
      case 'reportsPanel': return <ReportsPanel />;
      case 'quickActions': return <QuickActions />;
      case 'recentActivity': return <RecentActivity />;
      case 'upcomingEvents': return <UpcomingEvents />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">School Operations Command Center</h2>
          <p className="text-xs font-medium text-slate-500">Drag widgets to reorder. Manage widgets from settings.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu.Root open={isWidgetMenuOpen} onOpenChange={setIsWidgetMenuOpen}>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Customize</span>
              </button>
            </DropdownMenu.Trigger>

            <AnimatePresence>
              {isWidgetMenuOpen && (
                <DropdownMenu.Portal forceMount>
                  <DropdownMenu.Content
                    asChild
                    align="end"
                    sideOffset={8}
                    className="z-50"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-2"
                    >
                      <div className="px-3 py-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        Visible Widgets
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-1">
                        {Object.entries(WIDGET_TITLES).map(([id, title]) => {
                          const isVisible = visibleWidgets.includes(id);
                          return (
                            <button
                              key={id}
                              onClick={(e) => { e.preventDefault(); toggleWidget(id); }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group outline-none ${isVisible ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
                            >
                              <span className="text-sm font-medium">{title}</span>
                              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isVisible ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                {isVisible && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              )}
            </AnimatePresence>
          </DropdownMenu.Root>

          <button 
            onClick={resetLayout}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Reset to default layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout as any }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={true}
        isResizable={true}
        margin={[16, 16]}
        useCSSTransforms={true}
      >
        {visibleWidgets.map(id => {
          // Find if it has a static layout predefined in DEFAULT_LAYOUT or is dynamic
          const isStatic = id === 'executiveHero';
          return (
            <div key={id} className={isStatic ? '' : 'drag-handle cursor-move h-full group relative'} data-grid={isStatic ? { x: 0, y: 0, w: 12, h: 2, static: true } : undefined}>
              {!isStatic && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded shadow-sm z-10 transition-opacity">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  </div>
                </div>
              )}
              {renderWidget(id)}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardHome;
