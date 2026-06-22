import React from 'react';
import { EnterpriseTable } from '../../../components/EnterpriseTable';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Layers, Loader2 } from 'lucide-react';

export const SubjectClassManagement: React.FC = () => {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academics/classes').then(res => res.data.data),
  });

  const columns = [
    { header: 'Class Name', accessorKey: 'name', sortable: true },
    { header: 'Section', accessorKey: 'section', sortable: true },
    { header: 'Academic Year', accessorKey: 'academicYear', sortable: true },
    { header: 'Course', cell: ({ row }: any) => row.course?.name || 'N/A' },
    { header: 'Campus', cell: ({ row }: any) => row.school?.name || 'N/A' },
  ];

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  // Generate large mock data to demonstrate EnterpriseTable capabilities
  // In a real scenario, this would be real data.
  const mockData = Array.from({ length: 1500 }).map((_, i) => ({
    id: `mock-${i}`,
    name: `Class ${Math.floor(i / 10) + 1}`,
    section: String.fromCharCode(65 + (i % 5)),
    academicYear: '2026-2027',
    course: { name: 'High School Diploma' },
    school: { name: 'Main Campus' }
  }));

  const displayData = classes && classes.length > 0 ? classes : mockData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject & Class Configurations</h2>
            <p className="text-sm text-slate-500">Manage thousands of sections with Enterprise Data Tables.</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-semibold">
          Create New Configuration
        </button>
      </div>

      <div className="h-[600px]">
        <EnterpriseTable 
          data={displayData} 
          columns={columns} 
          title="Active Classes & Sections" 
        />
      </div>
    </div>
  );
};
