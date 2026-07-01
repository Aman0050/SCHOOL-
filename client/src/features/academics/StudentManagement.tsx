import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../lib/api';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../auth/authContext';
import { useStudentLayoutStore } from './store/useStudentLayoutStore';

// Icons
import { LayoutDashboard, Users, UserPlus, Search, Filter, Loader2, Download, Upload } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableSkeleton } from "../../components/ui/skeletons/TableSkeleton";

// Grid Components
import { StudentExecutiveHero } from './components/student/dashboard/StudentExecutiveHero';
import { EnrollmentAnalytics } from './components/student/dashboard/EnrollmentAnalytics';
import { StudentRiskMonitor } from './components/student/dashboard/StudentRiskMonitor';
import { DemographicDistribution } from './components/student/dashboard/DemographicDistribution';
import { LiveStudentActivity } from './components/student/dashboard/LiveStudentActivity';

// Profile Component
import { StudentProfile } from './components/student/profile/StudentProfile';

// Admissions Component
import { AdmissionsPipeline } from './components/admissions/AdmissionsPipeline';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Memoized Row Component to prevent unnecessary re-renders
const StudentRow = React.memo(({ student, virtualRow, onClick }: { student: any, virtualRow: any, onClick: () => void }) => {
  return (
    <tr 
      onClick={onClick}
      className="absolute top-0 left-0 w-full flex items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800"
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      <td className="px-6 py-4 flex-1 flex items-center gap-3">
        {student.profile?.avatarUrl ? (
          <img 
            src={student.profile.avatarUrl} 
            alt={`${student.firstName} ${student.lastName}`} 
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-sm font-bold text-primary dark:text-primary">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
        )}
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {student.firstName} {student.lastName}
          </div>
          <div className="text-xs text-slate-500">{student.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 font-medium w-48">{student.admission?.admissionNumber || 'N/A'}</td>
      <td className="px-6 py-4 w-48">{student.enrollments?.[0]?.class?.name || 'Unassigned'}</td>
      <td className="px-6 py-4 w-32">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          student.status === 'ACTIVE' || student.isActive
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {student.status || (student.isActive ? 'ACTIVE' : 'INACTIVE')}
        </span>
      </td>
      <td className="px-6 py-4 text-right w-32">
        <button className="text-primary hover:text-primary font-semibold text-sm">View Profile</button>
      </td>
    </tr>
  );
});

export const StudentManagement: React.FC = () => {
  const { user } = useAuth();
  const { layout, saveLayout, resetLayout } = useStudentLayoutStore(user?.id || 'default');
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  
  const initialTab = (searchParams.get('tab') as 'dashboard' | 'directory' | 'admissions') || 'dashboard';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'admissions'>(initialTab);

  React.useEffect(() => {
    const tab = searchParams.get('tab') as 'dashboard' | 'directory' | 'admissions';
    if (tab) setActiveTab(tab);
  }, [searchParams]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const handleRowClick = React.useCallback((id: string) => setSelectedStudentId(id), []);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // WebSocket Live Updates
  React.useEffect(() => {
    if (!socket) return;

    const handleInvalidate = (data: { queryKey: string[] }) => {
      // Invalidate the specific queries to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: data.queryKey });
    };

    socket.on('invalidate_cache', handleInvalidate);

    return () => {
      socket.off('invalidate_cache', handleInvalidate);
    };
  }, [socket, queryClient]);

  // 1. Fetch Intelligence Stats for Dashboard
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats'],
    queryFn: () => api.get('/analytics/students').then((res) => res.data.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // 2. Fetch Directory Students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-directory', searchQuery, classFilter],
    queryFn: () => api.get('/students', { params: { search: searchQuery, classId: classFilter, limit: 100 } }).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });

  const students = React.useMemo(() => (Array.isArray(studentsData) ? studentsData : studentsData?.students || []), [studentsData]);

  // Table Virtualization
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  
  const handleExportCSV = () => {
    if (!students.length) {
      return;
    }
    
    const headers = ['Name', 'Email', 'Admission No', 'Class', 'Status'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        `"${student.firstName} ${student.lastName}"`,
        `"${student.email}"`,
        `"${student.admission?.admissionNumber || ''}"`,
        `"${student.enrollments?.[0]?.class?.name || 'Unassigned'}"`,
        `"${student.status || (student.isActive ? 'ACTIVE' : 'INACTIVE')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `student_directory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const rowVirtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 80, // Approximate row height
    overscan: 5,
  });

  if (selectedStudentId) {
    return <StudentProfile studentId={selectedStudentId} onBack={() => setSelectedStudentId(null)} />;
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
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'directory'
              ? 'border-primary/30 text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Enterprise Directory
        </button>
        <button
          onClick={() => setActiveTab('admissions')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'admissions'
              ? 'border-primary/30 text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Admissions Workflow
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <ResponsiveGridLayout
            className="layout"
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={70}
            draggableHandle=".drag-handle"
            isDraggable={false}
            isResizable={false}
            margin={[16, 16]}
            useCSSTransforms={true}
          >
            <div key="studentHero" data-grid={{ x: 0, y: 0, w: 12, h: 3, static: true }} className="h-full">
              <StudentExecutiveHero stats={stats} />
            </div>
            <div key="enrollmentAnalytics" data-grid={{ x: 0, y: 3, w: 8, h: 5 }} className="h-full"><EnrollmentAnalytics /></div>
            <div key="studentRisk" data-grid={{ x: 8, y: 3, w: 4, h: 5 }} className="h-full"><StudentRiskMonitor /></div>
            <div key="demographics" data-grid={{ x: 0, y: 8, w: 6, h: 5 }} className="h-full"><DemographicDistribution stats={stats} /></div>
            <div key="liveActivity" data-grid={{ x: 6, y: 8, w: 6, h: 5 }} className="h-full"><LiveStudentActivity /></div>
          </ResponsiveGridLayout>
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Advanced Search Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Instant search by Name, Roll No, Parent Mobile..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/10 dark:border-primary/30/30 dark:text-primary' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <Filter className="h-4 w-4" /> Advanced Filters
              </button>
            </div>
            <div className="flex gap-2">
               <button onClick={handleExportCSV} className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 hover:text-primary transition-colors" title="Export CSV"><Download className="h-4 w-4"/></button>
            </div>
          </div>

          {/* Collapsible Advanced Filters Panel */}
          {showFilters && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-fade-in flex gap-4 flex-wrap">
              <div className="flex flex-col gap-1.5 w-48">
                <label className="text-xs font-semibold text-slate-500 uppercase">Class Filter</label>
                <select 
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
                >
                  <option value="">All Classes</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 w-48">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300">
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>
            </div>
          )}

          {/* Enterprise Data Table with Virtualization */}
          <div className="overflow-x-auto">
            {studentsLoading ? (
              <TableSkeleton columns={5} rows={10} />
            ) : (
              <div 
                ref={tableContainerRef} 
                className="w-full h-[600px] overflow-auto relative custom-scrollbar"
              >
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs sticky top-0 z-10 w-full flex">
                    <tr className="flex w-full">
                      <th className="px-6 py-4 font-semibold flex-1">Student</th>
                      <th className="px-6 py-4 font-semibold w-48">Adm No</th>
                      <th className="px-6 py-4 font-semibold w-48">Class</th>
                      <th className="px-6 py-4 font-semibold w-32">Status</th>
                      <th className="px-6 py-4 font-semibold text-right w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody 
                    className="block relative w-full"
                    style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                  >
                    {students.length === 0 ? (
                      <tr className="flex w-full absolute top-10">
                        <td className="py-12 w-full text-center text-slate-500">No students found.</td>
                      </tr>
                    ) : (
                      rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const student = students[virtualRow.index];
                        return (
                          <StudentRow 
                            key={virtualRow.key}
                            student={student}
                            virtualRow={virtualRow}
                            onClick={() => handleRowClick(student.id)}
                          />
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admissions' && (
        <AdmissionsPipeline />
      )}
    </div>
  );
};

export default StudentManagement;
