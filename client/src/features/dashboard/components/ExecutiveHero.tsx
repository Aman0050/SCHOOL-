import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, DownloadCloud } from 'lucide-react';
import api from '../../../lib/api';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ScoreRing = ({ score, title, color }: { score: number, title: string, color: string }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  return (
    <div className="flex flex-col items-center justify-center relative w-20 h-20 sm:w-24 sm:h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="rgba(255,255,255,0.1)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm sm:text-lg font-bold text-white">{score}</span>
      </div>
      <span className="absolute -bottom-6 text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider text-center w-32">{title}</span>
    </div>
  );
};

export const ExecutiveHero: React.FC<any> = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: healthData } = useQuery({
    queryKey: ['analytics', 'health'],
    queryFn: () => api.get('/analytics/health').then(res => res.data.data),
  });

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

  const overall = healthData?.overallScore || 92;
  const academic = healthData?.breakdown?.academics || 88;
  const financial = 85; // Mock financial health

  return (
    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 flex items-center justify-between shadow-lg border border-slate-700 overflow-visible relative">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
      <div className="absolute right-40 -bottom-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
      
      <div className="z-10 flex items-center gap-6 text-white max-w-xl">
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hidden sm:block shadow-xl">
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Executive Dashboard</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time intelligence on school health. Academic performance is up 3.2% this quarter. Cash flow remains stable.
          </p>
        </div>
      </div>

      <div className="z-10 hidden lg:flex items-center gap-10 mt-4 mr-4">
        <div className="flex gap-8 border-r border-white/10 pr-10">
          <ScoreRing score={overall} title="Overall Health" color="#10b981" />
          <ScoreRing score={academic} title="Academic Health" color="#8b5cf6" />
          <ScoreRing score={financial} title="Financial Health" color="#f59e0b" />
        </div>
        
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex flex-col items-center justify-center gap-2 group outline-none"
        >
          <div className="h-14 w-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
            {isGenerating ? <Loader2 className="h-6 w-6 text-indigo-300 animate-spin" /> : <DownloadCloud className="h-6 w-6 text-indigo-300 group-hover:text-indigo-200 transition-colors" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
            {isGenerating ? 'Generating' : 'Daily PDF'}
          </span>
        </button>
      </div>
    </div>
  );
};
