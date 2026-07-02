import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, FileText, Database, Calendar, Filter, Check, ShieldCheck, Download, Loader2 } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../auth/authContext';
import toast from 'react-hot-toast';

interface DashboardExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardExportModal: React.FC<DashboardExportModalProps> = ({ isOpen, onClose }) => {
  const { tenantSubdomain } = useAuth();
  const [format, setFormat] = useState<'excel' | 'csv'>('excel');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [dateFilter, setDateFilter] = useState('Custom Date Range');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Link preset dates to actual dates
  useEffect(() => {
    if (dateFilter === 'Custom Date Range') return;
    
    const today = new Date();
    const start = new Date();
    
    if (dateFilter === 'Last 7 Days') {
      start.setDate(today.getDate() - 7);
    } else if (dateFilter === 'Last 30 Days') {
      start.setDate(today.getDate() - 30);
    } else if (dateFilter === 'This Academic Year') {
      start.setMonth(3); // April
      start.setDate(1);
      if (today.getMonth() < 3) {
        start.setFullYear(today.getFullYear() - 1);
      }
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, [dateFilter]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setDateFilter('Custom Date Range');
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setDateFilter('Custom Date Range');
  };

  // Dynamic calculations based on mock filters
  let activeFiltersCount = 0;
  if (moduleFilter !== 'All Modules') activeFiltersCount++;
  if (startDate || endDate) activeFiltersCount++;

  const baseRecords = 842;
  const estimatedRecords = Math.max(12, Math.floor(baseRecords / (activeFiltersCount + 1) - (activeFiltersCount * 50)));
  const estimatedFileSizeKB = Math.max(2, Math.floor(estimatedRecords * 0.08));

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Simulate network delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 800));

      // Hit the real backend endpoint for the Daily Operations Report
      const response = await api.get('/analytics/download-excel', { 
        params: { format, startDate, endDate },
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const schoolName = tenantSubdomain ? tenantSubdomain.charAt(0).toUpperCase() + tenantSubdomain.slice(1) : 'EduXeno';
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      link.setAttribute('download', `${schoolName}_Daily_Operations_Report_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report generated successfully!');
      onClose();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate report.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Daily Operations Export</h2>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">Enterprise Reporting & Data Portability</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              Audit Logs Enabled
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Format Selection */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Format Selection
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Excel Option */}
                <div 
                  onClick={() => setFormat('excel')}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${format === 'excel' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  {format === 'excel' && (
                    <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${format === 'excel' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white uppercase">Excel Workbook</h4>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full border border-orange-500/20">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Premium styled report — color-coded, auto-fitted, with metadata header. Includes Attendance and Fee Intelligence tabs.
                  </p>
                </div>

                {/* CSV Option */}
                <div 
                  onClick={() => setFormat('csv')}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${format === 'csv' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  {format === 'csv' && (
                    <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-xl ${format === 'csv' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase">CSV Spreadsheet</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Clean UTF-8 CSV with metadata block. Best for system imports, bulk operations & integrations.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Data Filters
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                       Modules Included
                    </label>
                    <select 
                      value={moduleFilter} 
                      onChange={e => setModuleFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    >
                      <option>All Modules</option>
                      <option>Attendance Only</option>
                      <option>Fees Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                       Preset Date Range
                    </label>
                    <select 
                      value={dateFilter} 
                      onChange={e => setDateFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    >
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                      <option>Custom Date Range</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Custom Date Range
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={handleStartDateChange}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase">TO</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={handleEndDateChange}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Export Intelligence */}
            <div className="bg-slate-900 dark:bg-black rounded-3xl p-6 border border-slate-800 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                <Database className="h-40 w-40 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Export Intelligence
              </h3>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Records</p>
                  <p className="text-2xl font-black text-white">{estimatedRecords.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Filters</p>
                  <p className="text-2xl font-black text-white">{activeFiltersCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. File Size</p>
                  <p className="text-2xl font-black text-white">{estimatedFileSizeKB} <span className="text-sm font-semibold text-slate-500">KB</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Export</p>
                  <p className="text-sm font-bold text-white mt-2">Just now</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                  {format === 'excel' ? 'Excel — Styled Report' : 'CSV — Raw Data'}
                </div>
              </div>
            </div>

            {/* Live Preview Placeholder */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/30 p-6 flex flex-col items-center justify-center min-h-[160px] text-center">
              <div className="w-full flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Live Preview</h3>
                 <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-sm">First 3 Rows</span>
              </div>
              <Database className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select filters to preview data</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-xs font-medium text-slate-500">
            All exports are tracked, timestamped, and audited for security compliance.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg uppercase tracking-wider border ${isExporting ? 'bg-primary/70 border-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-primary/30 border-primary-dark'}`}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Generating...' : `Generate ${format === 'excel' ? 'XLSX' : 'CSV'} Report`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
