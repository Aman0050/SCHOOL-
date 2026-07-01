import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { MessageSquare, Mail, Download, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const DefaulterDashboard = () => {
  const { data: report, isLoading } = useQuery({
    queryKey: ['dueReport'],
    queryFn: () => api.get('/fees/reports/due').then(res => res.data.data),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academics/classes').then(res => res.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['feeCategories'],
    queryFn: () => api.get('/fees/categories').then(res => res.data.data),
  });

  const assignments = report?.assignments || [];

  const handleExportCSV = () => {
    if (!assignments || assignments.length === 0) {
      toast.error('No data to export');
      return;
    }
    const csvContent = [
      ['Student', 'Admission No', 'Class', 'Due Amount', 'Status'],
      ...assignments.map((a: any) => [
        `"${a.student?.firstName} ${a.student?.lastName}"`,
        `"${a.student?.admission?.admissionNumber || 'N/A'}"`,
        `"${a.feeStructure?.class?.name || 'N/A'}"`,
        a.dueAmount,
        a.status
      ])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "defaulters_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };



  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Defaulters Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage and communicate with students who have overdue fees.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-semibold"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>

        </div>
      </div>
      
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex gap-4">
        <select className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option value="">All Classes</option>
          {classes?.map((cls: any) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
        <select className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option value="">All Fee Categories</option>
          {categories?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option value="">Any Due Date</option>
          <option value="30">Overdue by 30+ Days</option>
          <option value="90">Overdue by 90+ Days</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">Class</th>
              <th className="px-6 py-4 font-semibold">Overdue Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Loading defaulters...
                </td>
              </tr>
            ) : assignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No students with pending or overdue fees found.
                </td>
              </tr>
            ) : (
              assignments.map((assignment: any) => (
                <tr key={assignment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {assignment.student?.firstName} {assignment.student?.lastName}
                    </div>
                    <div className="text-xs">
                      {assignment.student?.admission?.admissionNumber || 'No ADM No.'}
                    </div>
                  </td>
                  <td className="px-6 py-4">{assignment.feeStructure?.class?.name || 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-red-500">₹{Number(assignment.dueAmount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-amber-500 font-semibold">{assignment.status}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10 dark:hover:bg-primary/10">
                      <Mail className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
