import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ShieldAlert, HeartPulse } from 'lucide-react';

interface HealthScoreDialProps {
  score: number;
  category: string;
}

export const HealthScoreDial: React.FC<HealthScoreDialProps> = ({ score, category }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  let color = '#10B981'; // Emerald
  let Icon = ShieldCheck;
  if (score < 60) {
    color = '#EF4444'; // Red
    Icon = ShieldAlert;
  } else if (score < 80) {
    color = '#F59E0B'; // Amber
    Icon = HeartPulse;
  }

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={40}
          >
            <Cell fill={color} />
            <Cell fill="#f1f5f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <Icon className="w-6 h-6 mb-1" style={{ color }} />
        <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{score}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{category}</span>
      </div>
    </div>
  );
};

export default HealthScoreDial;
