import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../auth/authContext';
import { useDashboardLayout } from './store/useDashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

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

const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { layout, saveLayout, resetLayout } = useDashboardLayout(user?.id || 'default');

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">School Operations Command Center</h2>
        <button 
          onClick={resetLayout}
          className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
        >
          Reset Layout
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={true}
        isResizable={true}
        margin={[16, 16]}
      >
        <div key="executiveHero" data-grid={{ x: 0, y: 0, w: 12, h: 2, static: true }}>
          <ExecutiveHero 
            healthScore={healthData?.overallScore || 0}
            attendanceRate={attendanceData?.students?.rate?.toFixed(1) || 0}
            feeCollection={feeData?.collection?.percentage || 0}
            alertsCount={alertsData?.alerts?.length || 0}
          />
        </div>
        <div key="healthScore" className="drag-handle cursor-move h-full"><HealthScore /></div>
        <div key="operations" className="drag-handle cursor-move h-full"><Operations /></div>
        <div key="criticalAction" className="drag-handle cursor-move h-full"><CriticalAction /></div>
        <div key="attendanceAnalytics" className="drag-handle cursor-move h-full"><AttendanceAnalytics /></div>
        <div key="feeAnalytics" className="drag-handle cursor-move h-full"><FeeAnalytics /></div>
        <div key="academicAnalytics" className="drag-handle cursor-move h-full"><AcademicAnalytics /></div>
        <div key="studentIntel" className="drag-handle cursor-move h-full"><StudentIntel /></div>
        <div key="teacherIntel" className="drag-handle cursor-move h-full"><TeacherIntel /></div>
        <div key="communication" className="drag-handle cursor-move h-full"><Communication /></div>
        <div key="quickActions" className="drag-handle cursor-move h-full"><QuickActions /></div>
        <div key="recentActivity" className="drag-handle cursor-move h-full"><RecentActivity /></div>
        <div key="upcomingEvents" className="drag-handle cursor-move h-full"><UpcomingEvents /></div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardHome;
