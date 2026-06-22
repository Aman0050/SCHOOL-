import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Users, CheckCircle2, Award } from 'lucide-react';

const teacherImpact = [
  { name: 'S. Sharma', completion: 98, avgStudentScore: 88, classes: 45 },
  { name: 'K. Patel', completion: 95, avgStudentScore: 82, classes: 42 },
  { name: 'M. Singh', completion: 85, avgStudentScore: 75, classes: 38 },
  { name: 'R. Verma', completion: 92, avgStudentScore: 85, classes: 40 },
  { name: 'A. Gupta', completion: 78, avgStudentScore: 68, classes: 35 },
];

export const TeacherAnalytics: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Teacher Analytics</h1>
        <p className="text-slate-500">Measure academic impact and operational completion rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-indigo-100 font-semibold uppercase tracking-wider mb-1 text-sm">Top Performing Teacher</p>
          <div className="flex items-center gap-2 mt-2">
            <Award className="w-8 h-8 text-amber-300" />
            <h2 className="text-3xl font-black">S. Sharma</h2>
          </div>
          <p className="text-sm text-indigo-100 mt-2">88% Avg Student Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Operational Completion Rate</h3>
          <p className="text-sm text-slate-500 mb-4">Percentage of attendance & marks submitted on time.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherImpact} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="completion" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Academic Impact Analysis</h3>
          <p className="text-sm text-slate-500 mb-4">Correlation between completion rate (X) and student scores (Y). Bubble size = Classes taught.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="completion" name="Completion Rate" unit="%" domain={[70, 100]} tick={{fill: '#64748b'}} />
                <YAxis type="number" dataKey="avgStudentScore" name="Avg Score" unit="%" domain={[60, 100]} tick={{fill: '#64748b'}} />
                <ZAxis type="number" dataKey="classes" range={[100, 500]} name="Classes Taught" />
                <Tooltip cursor={{strokeDasharray: '3 3'}} />
                <Scatter name="Teachers" data={teacherImpact} fill="#10b981" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
