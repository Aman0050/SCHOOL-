import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { GraduationCap, Brain, Target } from 'lucide-react';

const subjectData = [
  { subject: 'Maths', passRate: 85, avgScore: 75, fullMark: 100 },
  { subject: 'Science', passRate: 92, avgScore: 82, fullMark: 100 },
  { subject: 'English', passRate: 98, avgScore: 88, fullMark: 100 },
  { subject: 'History', passRate: 90, avgScore: 78, fullMark: 100 },
  { subject: 'Art', passRate: 100, avgScore: 92, fullMark: 100 },
];

const classPerformance = [
  { name: '10-A', Math: 80, Science: 85, English: 90 },
  { name: '10-B', Math: 75, Science: 78, English: 85 },
  { name: '10-C', Math: 85, Science: 90, English: 92 },
];

export const ExamIntelligence: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Exam Intelligence</h1>
        <p className="text-slate-500">Subject performance, academic risk profiling, and class rankings.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Overall Pass Rate</p>
            <h2 className="text-3xl font-black text-slate-800">88.5%</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Top Subject</p>
            <h2 className="text-2xl font-black text-slate-800">Computer Science</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Lowest Subject</p>
            <h2 className="text-2xl font-black text-slate-800">Physics</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Performance Radar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Subject Performance Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 13, fontWeight: 600}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Radar name="Pass Rate %" dataKey="passRate" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name="Average Score" dataKey="avgScore" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Class Comparison (Grade 10)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{paddingTop: '10px'}} />
                <Bar dataKey="Math" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Science" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="English" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExamIntelligence;
