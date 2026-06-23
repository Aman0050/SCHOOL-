import { QueryClient } from '@tanstack/react-query';
import api from './api';

// Registry of component imports for chunk prefetching
const componentRegistry: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('../features/dashboard/DashboardHome'),
  '/dashboard/students': () => import('../features/academics/StudentManagement'),
  '/dashboard/attendance': () => import('../features/academics/AttendanceManagement'),
  '/dashboard/academics': () => import('../features/academics/AcademicManagement'),
  '/dashboard/examinations': () => import('../features/examinations/ExaminationManagement').then(m => ({ default: m.ExaminationManagement })),
  '/dashboard/fees': () => import('../features/fees/FeeManagement').then(m => ({ default: m.FeeManagement })),
  '/dashboard/platform/revenue': () => import('../features/platform/RevenueDashboard'),
  '/dashboard/platform/success': () => import('../features/platform/CustomerSuccessDashboard'),
};

/**
 * Intelligently prefetches both the React Component chunk (JS)
 * and the required data (API) before the user even clicks the link.
 */
export const prefetchRoute = (path: string, queryClient: QueryClient) => {
  // 1. Prefetch the JavaScript chunk
  const importFn = componentRegistry[path];
  if (importFn) {
    importFn().catch(() => {}); // Fire and forget
  }

  // 2. Prefetch the data based on the route
  if (path === '/dashboard/students') {
    queryClient.prefetchQuery({
      queryKey: ['studentStats'],
      queryFn: () => api.get('/analytics/students').then((res) => res.data.data),
      staleTime: 60000,
    });
  } else if (path === '/dashboard/attendance') {
    queryClient.prefetchQuery({
      queryKey: ['attendanceStats'],
      queryFn: () => api.get('/analytics/attendance').then((res) => res.data.data),
      staleTime: 60000,
    });
  } else if (path === '/dashboard/fees') {
    queryClient.prefetchQuery({
      queryKey: ['feeIntelligence'],
      queryFn: () => api.get('/analytics/fees').then((res) => res.data.data),
      staleTime: 60000,
    });
  } else if (path === '/dashboard/academics') {
    queryClient.prefetchQuery({
      queryKey: ['teacherAnalytics'],
      queryFn: () => api.get('/analytics/teacher').then((res) => res.data.data),
      staleTime: 60000,
    });
  }
};
