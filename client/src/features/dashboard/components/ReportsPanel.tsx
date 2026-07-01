import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Clock, Download, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../../lib/api';

export const ReportsPanel: React.FC = () => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const response = await api.get('/analytics/daily-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Daily_Operations_Report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF Download failed:', error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const response = await api.get('/analytics/download-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Analytics_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Excel Download failed:', error);
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleSchedule = () => {
    setScheduling(true);
    setTimeout(() => {
      setScheduling(false);
      setScheduled(true);
      setTimeout(() => setScheduled(false), 3000);
    }, 1000);
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Reports Engine</h3>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {/* PDF Export */}
        <button 
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="flex items-center justify-between w-full p-3 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-100 dark:border-rose-500/30 rounded-xl transition-colors group outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-lg group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Daily Operations (PDF)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Executive summary of today's health</p>
            </div>
          </div>
          {downloadingPdf ? <Loader2 className="w-5 h-5 text-rose-500 animate-spin" /> : <Download className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />}
        </button>

        {/* Excel Export */}
        <button 
          onClick={handleDownloadExcel}
          disabled={downloadingExcel}
          className="flex items-center justify-between w-full p-3 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/30 rounded-xl transition-colors group outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Raw Analytics (Excel)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Detailed spreadsheet of all metrics</p>
            </div>
          </div>
          {downloadingExcel ? <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /> : <Download className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />}
        </button>

        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>

        {/* Scheduled Reports */}
        <div className="flex items-center justify-between w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Scheduled Delivery</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Nightly PDF delivery via email</p>
            </div>
          </div>
          <button 
            onClick={handleSchedule}
            disabled={scheduling || scheduled}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${scheduled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
          >
            {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : scheduled ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Active</span> : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
};
