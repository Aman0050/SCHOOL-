import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from "../auth/authContext";
import { useAttendanceLayoutStore } from './store/useAttendanceLayoutStore';
import { PageSkeleton } from '../../components/ui/skeletons/PageSkeleton';

// Icons
import { LayoutDashboard, Users, CalendarDays, Loader2, Save, Download, Cpu } from 'lucide-react';

// Grid Components
import { AttendanceExecutiveHero } from './components/attendance/dashboard/AttendanceExecutiveHero';
import { AttendanceHealth } from './components/attendance/dashboard/AttendanceHealth';
import { RealTimeMonitoring } from './components/attendance/dashboard/RealTimeMonitoring';
import { StudentAnalyticsCharts } from './components/attendance/dashboard/StudentAnalyticsCharts';
import { SmartAlerts } from './components/attendance/dashboard/SmartAlerts';
import { LiveAttendanceFeed } from './components/attendance/dashboard/LiveAttendanceFeed';

import { syncEngine } from '../../lib/syncEngine';

import toast from 'react-hot-toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

const AttendanceRow = React.memo(({ 
  student, 
  idx, 
  currentStatus, 
  onStatusChange 
}: { 
  student: any, 
  idx: number, 
  currentStatus: string, 
  onStatusChange: (id: string, status: string) => void 
}) => {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 font-medium">{student.rollNumber || idx + 1}</td>
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
            {student.profile?.firstName?.[0]}
          </div>
          {student.profile?.firstName} {student.profile?.lastName}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900">
          {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(student.id, status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                currentStatus === status
                  ? status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-sm'
                  : status === 'ABSENT' ? 'bg-red-500 text-white shadow-sm'
                  : status === 'LATE' ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
});

export const AttendanceManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { layout, saveLayout, resetLayout } = useAttendanceLayoutStore(user?.id || 'default');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workspace' | 'analytics'>('dashboard');

  // Daily Workspace State
  const [rosterDate, setRosterDate] = useState(new Date().toISOString().split('T')[0]);
  const [rosterClassId, setRosterClassId] = useState('');
  const [attendanceStates, setAttendanceStates] = useState<{ [userId: string]: string }>({});

  // 1. Fetch Intelligence Stats for Dashboard
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['attendanceStats'],
    queryFn: () => api.get('/analytics/attendance').then((res) => res.data.data),
  });

  const { data: alerts } = useQuery({
    queryKey: ['attendanceAlerts'],
    queryFn: () => api.get('/attendance/alerts').then((res) => res.data.data || []),
  });

  const { data: submissionStatus } = useQuery({
    queryKey: ['submissionStatus'],
    queryFn: () => api.get('/attendance/submission-status').then((res) => res.data.data),
  });

  // 2. Fetch Classes
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academics/classes').then((res) => res.data.data),
  });

  // 3. Fetch Roster Students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['roster-students', rosterClassId],
    queryFn: () => api.get('/students', { params: { classId: rosterClassId, limit: 100 } }).then((res) => res.data.data),
    enabled: !!rosterClassId,
  });

  const students = studentsData?.students || [];

  // Initialize attendance states as PRESENT when student list loads
  React.useEffect(() => {
    if (students.length > 0) {
      const initial: any = {};
      students.forEach((s: any) => {
        initial[s.id] = 'PRESENT';
      });
      setAttendanceStates(initial);
    }
  }, [students]);

  // Fetch existing attendance logs
  const { data: existingLogs } = useQuery({
    queryKey: ['existing-attendance', rosterClassId, rosterDate],
    queryFn: () => api.get('/attendance', { params: { classId: rosterClassId, date: rosterDate } }).then((res) => res.data.data),
    enabled: !!rosterClassId && !!rosterDate,
  });

  React.useEffect(() => {
    if (existingLogs && existingLogs.length > 0) {
      const mapped: any = {};
      existingLogs.forEach((log: any) => {
        mapped[log.userId] = log.status;
      });
      setAttendanceStates((prev) => ({ ...prev, ...mapped }));
    }
  }, [existingLogs]);

  const recordBulkMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!navigator.onLine) {
        // Queue the request for offline sync
        const token = localStorage.getItem('token');
        await syncEngine.queueRequest({
          url: '/api/attendance/bulk',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: payload
        });
        return { data: { message: 'Queued for sync' } };
      }
      return api.post('/attendance/bulk', payload);
    },
    onMutate: async (newAttendance) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['existing-attendance', rosterClassId, rosterDate] });
      
      // Snapshot the previous value
      const previousAttendance = queryClient.getQueryData(['existing-attendance', rosterClassId, rosterDate]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['existing-attendance', rosterClassId, rosterDate], (old: any) => {
        return newAttendance.records.map((rec: any) => ({
          userId: rec.userId,
          status: rec.status,
          date: newAttendance.date,
          classId: newAttendance.classId
        }));
      });

      return { previousAttendance };
    },
    onError: (err, newAttendance, context) => {
      // Rollback on error
      if (context?.previousAttendance) {
        queryClient.setQueryData(['existing-attendance', rosterClassId, rosterDate], context.previousAttendance);
      }
      toast.error('Failed to save attendance. Changes rolled back.');
    },
    onSuccess: () => {
      // We don't necessarily need to wait for invalidation if the optimistic UI handles it, but good to refresh stats
      toast.success('Attendance saved successfully');
      queryClient.invalidateQueries({ queryKey: ['attendanceStats'] });
    },
    onSettled: () => {
      // Always sync with server eventually
      queryClient.invalidateQueries({ queryKey: ['existing-attendance', rosterClassId, rosterDate] });
    }
  });

  const handleBulkSubmit = () => {
    const records = Object.entries(attendanceStates).map(([userId, status]) => ({
      userId,
      status,
    }));
    recordBulkMutation.mutate({
      date: rosterDate,
      classId: rosterClassId,
      records,
    });
  };

  const handleSetAll = (status: string) => {
    const updated: any = {};
    students.forEach((s: any) => {
      updated[s.id] = status;
    });
    setAttendanceStates(updated);
  };

  const handleStatusChange = React.useCallback((studentId: string, status: string) => {
    setAttendanceStates(prev => ({ ...prev, [studentId]: status }));
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (rosterClassId && students.length > 0) {
          handleBulkSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rosterClassId, students, attendanceStates]);

  if (statsLoading && activeTab === 'dashboard') {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'dashboard'
              ? 'border-primary/30 text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Intelligence Dashboard
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'workspace'
              ? 'border-primary/30 text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Daily Workspace
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-4">

          <ResponsiveGridLayout
            className="layout"
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={70}
            layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
            onLayoutChange={(currentLayout) => saveLayout(currentLayout as any[])}
            draggableHandle=".drag-handle"
            isDraggable={true}
            isResizable={true}
            margin={[16, 16]}
          >
            {layout.map((item: any) => {
              const isStatic = item.static;
              return (
                <div key={item.i} className={isStatic ? '' : 'h-full group relative'}>
                  {!isStatic && (
                    <div className="drag-handle cursor-move absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded shadow-sm z-10 transition-opacity">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-slate-400 rounded-full pointer-events-none" />
                        <div className="w-1 h-1 bg-slate-400 rounded-full pointer-events-none" />
                        <div className="w-1 h-1 bg-slate-400 rounded-full pointer-events-none" />
                      </div>
                    </div>
                  )}
                  {item.i === 'attendanceHero' && <AttendanceExecutiveHero stats={stats} />}
                  {item.i === 'healthScore' && <div className="h-full"><AttendanceHealth stats={stats} /></div>}
                  {item.i === 'realTimeMonitoring' && <div className="h-full"><RealTimeMonitoring submissionStatus={submissionStatus} /></div>}
                  {item.i === 'studentAnalytics' && <div className="h-full"><StudentAnalyticsCharts stats={stats} /></div>}
                  {item.i === 'smartAlerts' && <div className="h-full"><SmartAlerts alerts={alerts} /></div>}
                  {item.i === 'liveFeed' && <div className="h-full"><LiveAttendanceFeed /></div>}
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      )}

      {activeTab === 'workspace' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Class</label>
              <select 
                value={rosterClassId}
                onChange={(e) => setRosterClassId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <option value="">-- Choose Class --</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Date</label>
              <input 
                type="date"
                value={rosterDate}
                onChange={(e) => setRosterDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>

          {!rosterClassId ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Select a class and date to load the attendance roster.</p>
            </div>
          ) : studentsLoading ? (
            <div className="p-12 text-center flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div>
              <div className="p-4 bg-white dark:bg-slate-900 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <button onClick={() => handleSetAll('PRESENT')} className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors">Mark All Present</button>
                  <button onClick={() => handleSetAll('ABSENT')} className="px-3 py-1 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors">Mark All Absent</button>
                </div>
                <button 
                  onClick={handleBulkSubmit}
                  disabled={recordBulkMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors font-semibold"
                >
                  {recordBulkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Attendance
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Roll No</th>
                      <th className="px-6 py-4 font-semibold">Student Name</th>
                      <th className="px-6 py-4 font-semibold text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {students.map((student: any, idx: number) => (
                      <AttendanceRow 
                        key={student.id} 
                        student={student} 
                        idx={idx} 
                        currentStatus={attendanceStates[student.id]} 
                        onStatusChange={handleStatusChange} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Status Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> All students marked</span>
                  <span>Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Ctrl+S</kbd> to quick save</span>
                </div>
                <div>
                  {recordBulkMutation.isPending ? 'Saving...' : 'Ready'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
