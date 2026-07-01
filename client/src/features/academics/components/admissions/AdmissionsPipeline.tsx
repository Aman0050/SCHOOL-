import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Download, Upload, Plus, FileText, CheckCircle2, 
  Clock, UserPlus, MoreHorizontal, Calendar, AlertCircle, X, Loader2,
  ChevronLeft, ChevronRight, Eye, Edit, UserCheck, XCircle, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';
import { NewAdmissionModal } from './NewAdmissionModal';
import { ApplicationProfileDrawer } from './ApplicationProfileDrawer';
import { AdmissionsAnalytics } from './AdmissionsAnalytics';

export const AdmissionsPipeline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(() => searchParams.get('action') === 'new');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async (syncApplicantId?: string) => {
    try {
      if (!syncApplicantId) setIsLoading(true);
      const response = await api.get('/applicants');
      setApplicants(response.data);
      // If called from drawer, re-sync the open applicant with fresh data (includes new docs/assessments)
      if (syncApplicantId) {
        const fresh = response.data.find((a: any) => a.id === syncApplicantId);
        if (fresh) setSelectedApplicant(fresh);
      }
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
    } finally {
      if (!syncApplicantId) setIsLoading(false);
    }
  };

  const handleCreateApplicant = async (formData: any) => {
    try {
      const response = await api.post('/applicants', formData);
      setApplicants(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      toast.success('Application registered successfully!');
    } catch (error: any) {
      console.error('Failed to create applicant:', error);
      // Re-throw so the modal's catch block can show the toast error
      throw error;
    }
  };

  const handleEnroll = async (appId: string) => {
    try {
      await api.post(`/applicants/${appId}/enroll`);
      setApplicants(prev => prev.filter(app => app.id !== appId));
      setSelectedApplicant(null);
    } catch (error) {
      console.error('Failed to enroll student:', error);
    }
  };

  const handleUpdateStage = async (appId: string, newStage: string, newStatus: string) => {
    try {
      await api.put(`/applicants/${appId}/stage`, { stage: newStage, status: newStatus });
      setApplicants(prev => prev.map(app =>
        app.id === appId ? { ...app, stage: newStage, status: newStatus } : app
      ));
      if (selectedApplicant?.id === appId) {
        setSelectedApplicant((prev: any) => ({ ...prev, stage: newStage, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update applicant stage:', error);
    }
  };

  // Derived State (KPIs)
  const stats = useMemo(() => {
    const total = applicants.length;
    const pending = applicants.filter(a => a.stage === 'new-registrations' || a.stage === 'document-verification').length;
    const approved = applicants.filter(a => a.stage === 'approved').length;
    const docsPending = applicants.filter(a => a.stage === 'document-verification').length;
    
    return { total, pending, approved, docsPending };
  }, [applicants]);

  // Filtered & Paginated Data
  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch = 
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone?.includes(searchTerm);
        
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter || app.stage === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [applicants, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="h-full min-h-[600px] w-full bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full min-h-[600px] w-full bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      
      {/* Header Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Admissions Operations Center
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track student applications.</p>
          </div>
          <div className="flex gap-3">

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> New Admission
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Applications</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Docs Pending</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.docsPending}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approved</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.approved}</h3>
            </div>
          </div>
        </div>
      </div>

      {showAnalytics ? (
        <AdmissionsAnalytics applicants={applicants} />
      ) : (
        <>
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-end items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 mx-6 mb-6">
            <div className="flex gap-2 w-full md:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-[150px]"
              >
                <option value="All">All Statuses</option>
                <option value="new-registrations">New Registration</option>
                <option value="assessment-interview">Assessment</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Application ID</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Student Info</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Grade</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {paginatedApplicants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No applications found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedApplicants.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => setSelectedApplicant(app)}>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-primary dark:text-primary bg-primary/10 dark:bg-primary/10 px-2 py-1 rounded">
                              {app.applicationNumber || app.id.slice(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {app.firstName?.charAt(0)}{app.lastName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{app.firstName} {app.lastName}</p>
                                <p className="text-xs text-slate-500">{app.phone || 'No phone'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                            {app.grade}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                              ${app.stage === 'new-registrations' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' : ''}
                              ${app.stage === 'document-verification' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                              ${app.stage === 'assessment-interview' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' : ''}
                              ${app.stage === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                            `}>
                              <div className={`h-1.5 w-1.5 rounded-full 
                                ${app.stage === 'new-registrations' ? 'bg-primary' : ''}
                                ${app.stage === 'document-verification' ? 'bg-amber-500' : ''}
                                ${app.stage === 'assessment-interview' ? 'bg-primary' : ''}
                                ${app.stage === 'approved' ? 'bg-emerald-500' : ''}
                              `} />
                              {app.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {app.stage === 'approved' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEnroll(app.id); }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors font-medium text-xs flex items-center gap-1"
                                >
                                  <UserCheck className="h-4 w-4" /> Enroll
                                </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedApplicant(app); }}
                                className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded transition-colors"
                                title="View Details"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                  <span className="text-sm text-slate-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApplicants.length)} of {filteredApplicants.length} entries
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium px-3 text-slate-700 dark:text-slate-300">
                      {currentPage} / {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <NewAdmissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateApplicant}
      />

      {selectedApplicant && (
        <ApplicationProfileDrawer
          isOpen={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          applicant={selectedApplicant}
          onRefresh={() => fetchApplicants(selectedApplicant?.id)}
          onEnroll={() => {
            if (selectedApplicant) handleEnroll(selectedApplicant.id);
            setSelectedApplicant(null);
          }}
          onUpdateStage={(stage, status) => {
            if (selectedApplicant) handleUpdateStage(selectedApplicant.id, stage, status);
            setSelectedApplicant((prev: any) => ({...prev, stage, status}));
          }}
        />
      )}
    </div>
  );
};
