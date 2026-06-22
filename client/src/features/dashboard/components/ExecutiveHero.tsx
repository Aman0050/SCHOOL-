import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import api from '../../../lib/api';

export const ExecutiveHero: React.FC<any> = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const response = await api.get('/analytics/daily-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Daily_Operations_Report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center justify-between shadow-lg border border-slate-700 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-screen"></div>
      <div className="absolute right-40 -bottom-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen"></div>
      
      <div className="z-10 flex items-center gap-6 text-white max-w-3xl">
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hidden sm:block">
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Good morning, Principal Sarah!</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            School operations are running smoothly today. Attendance is up 2.4% from last week, 
            and 98% of today's classes are fully staffed.
          </p>
        </div>
      </div>

      <div className="z-10 hidden lg:flex items-center gap-4">
        <div className="flex flex-col items-end mr-4 border-r border-white/10 pr-6">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Overall Health</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">94</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
        >
          {isGenerating ? 'Generating...' : 'View Daily Report'}
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
