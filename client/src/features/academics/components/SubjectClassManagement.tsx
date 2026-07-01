import React, { useState } from 'react';
import { EnterpriseTable } from '../../../components/EnterpriseTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Layers, Loader2, Save } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export const SubjectClassManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academicYear: '2026-2027',
    schoolId: '',
    courseId: ''
  });

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academics/classes').then(res => res.data.data),
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => api.get('/schools').then(res => res.data.data.schools || res.data.data),
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/academics/courses').then(res => res.data.data),
  });

  const createClassMutation = useMutation({
    mutationFn: (newClass: any) => api.post('/academics/classes', newClass),
    onSuccess: () => {
      toast.success('Class created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', section: '', academicYear: '2026-2027', schoolId: '', courseId: '' });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.schoolId || !formData.courseId || !formData.academicYear) {
      toast.error('Please fill in all required fields');
      return;
    }
    createClassMutation.mutate(formData);
  };

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

  const displayData = classes || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-h3">Subject & Class Configurations</h2>
            <p className="text-muted">Manage thousands of sections with Enterprise Data Tables.</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="md"
        >
          Create New Configuration
        </Button>
      </div>

      <div className="h-[600px]">
        <EnterpriseTable 
          data={displayData} 
          columns={columns} 
          title="Active Classes & Sections" 
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Class Configuration"
        description="Add a new class section to a specific campus and course."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Campus/School *</label>
              <select 
                value={formData.schoolId}
                onChange={e => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                required
              >
                <option value="">Select a campus</option>
                {schools?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course/Program *</label>
              <select 
                value={formData.courseId}
                onChange={e => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                required
              >
                <option value="">Select a course</option>
                {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Name *</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Grade 10"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                <input 
                  type="text"
                  value={formData.section}
                  onChange={e => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  placeholder="e.g. A"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Year *</label>
              <input 
                type="text"
                value={formData.academicYear}
                onChange={e => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                placeholder="e.g. 2026-2027"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createClassMutation.isPending}
              className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {createClassMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Create Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectClassManagement;
