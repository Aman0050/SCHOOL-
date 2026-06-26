import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/authContext';
import { useSettings } from '../hooks/useSettings';
import { Loader2, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';

export const SchoolDetailsSettings: React.FC = () => {
  const { tenantSubdomain } = useAuth();
  const { updateSchool } = useSettings();

  const { data: schoolData, isLoading } = useQuery({
    queryKey: ['school-details'],
    queryFn: () => api.get('/schools').then(res => res.data.data?.[0])
  });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    website: '',
    academicYear: '2023-2024' // Mock default
  });

  useEffect(() => {
    if (schoolData) {
      setFormData({
        name: schoolData.name || '',
        address: schoolData.address || '',
        website: schoolData.website || '',
        academicYear: '2023-2024'
      });
    }
  }, [schoolData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchool.mutate(formData);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">School Details</h3>
          <p className="text-sm text-slate-500">Update global information for {tenantSubdomain}.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">School Name</label>
            <input 
              type="text" required value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition-shadow" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Academic Year</label>
            <select 
              value={formData.academicYear}
              onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-shadow" 
            >
              {Array.from({ length: 15 }, (_, i) => {
                const startYear = new Date().getFullYear() - 5 + i;
                const yearString = `${startYear}-${startYear + 1}`;
                return <option key={yearString} value={yearString}>{yearString}</option>;
              })}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Address</label>
            <textarea 
              rows={3} value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition-shadow custom-scrollbar" 
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" disabled={updateSchool.isPending}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/30"
          >
            {updateSchool.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Details
          </button>
        </div>
      </form>
    </div>
  );
};
