import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../auth/authContext';
import { useDashboardLayout, DEFAULT_LAYOUT } from './store/useDashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Settings2, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { ExecutiveHero } from './components/ExecutiveHero'; // Keep hero static for LCP optimization
const HealthScore = React.lazy(() => import('./components/HealthScore').then(m => ({ default: m.HealthScore })));
const Operations = React.lazy(() => import('./components/Operations').then(m => ({ default: m.Operations })));
const CriticalAction = React.lazy(() => import('./components/CriticalAction').then(m => ({ default: m.CriticalAction })));
const AttendanceAnalytics = React.lazy(() => import('./components/AttendanceAnalytics').then(m => ({ default: m.AttendanceAnalytics })));
const FeeAnalytics = React.lazy(() => import('./components/FeeAnalytics').then(m => ({ default: m.FeeAnalytics })));
const AcademicAnalytics = React.lazy(() => import('./components/AcademicAnalytics').then(m => ({ default: m.AcademicAnalytics })));
const StudentIntel = React.lazy(() => import('./components/StudentIntel').then(m => ({ default: m.StudentIntel })));
const TeacherIntel = React.lazy(() => import('./components/TeacherIntel').then(m => ({ default: m.TeacherIntel })));
const Communication = React.lazy(() => import('./components/Communication').then(m => ({ default: m.Communication })));
const QuickActions = React.lazy(() => import('./components/QuickActions').then(m => ({ default: m.QuickActions })));
const RecentActivity = React.lazy(() => import('./components/RecentActivity').then(m => ({ default: m.RecentActivity })));
const UpcomingEvents = React.lazy(() => import('./components/UpcomingEvents').then(m => ({ default: m.UpcomingEvents })));
const ReportsPanel = React.lazy(() => import('./components/ReportsPanel').then(m => ({ default: m.ReportsPanel })));

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
  const { data: aggregateData } = useQuery({
    queryKey: ['analytics', 'dashboard-aggregate'],
    queryFn: () => api.get('/analytics/dashboard-aggregate').then(res => res.data.data),
  });

  const attendanceData = aggregateData?.attendance;
  const feeData = aggregateData?.fees;
  const healthData = aggregateData?.health;
  const alertsData = aggregateData?.alerts;

  const onLayoutChange = React.useCallback((newLayout: any) => {
    saveLayout(newLayout);
  }, [saveLayout]);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'executiveHero': return <ExecutiveHero healthScore={healthData?.overallScore || 0} attendanceRate={attendanceData?.students?.rate?.toFixed(1) || 0} feeCollection={feeData?.collection?.percentage || 0} alertsCount={alertsData?.alerts?.length || 0} />;
      case 'healthScore': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><HealthScore /></React.Suspense>;
      case 'operations': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><Operations /></React.Suspense>;
      case 'criticalAction': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><CriticalAction /></React.Suspense>;
      case 'attendanceAnalytics': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><AttendanceAnalytics /></React.Suspense>;
      case 'feeAnalytics': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><FeeAnalytics /></React.Suspense>;
      case 'academicAnalytics': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><AcademicAnalytics /></React.Suspense>;
      case 'studentIntel': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><StudentIntel /></React.Suspense>;
      case 'teacherIntel': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><TeacherIntel /></React.Suspense>;
      case 'communication': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><Communication /></React.Suspense>;
      case 'reportsPanel': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><ReportsPanel /></React.Suspense>;
      case 'quickActions': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><QuickActions /></React.Suspense>;
      case 'recentActivity': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><RecentActivity /></React.Suspense>;
      case 'upcomingEvents': return <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>}><UpcomingEvents /></React.Suspense>;
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
          const isStatic = id === 'executiveHero';
          const defaultLayoutItem = DEFAULT_LAYOUT.find(l => l.i === id);
          
          return (
            <div key={id} className={isStatic ? '' : 'drag-handle cursor-move h-full group relative'} data-grid={defaultLayoutItem}>
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
