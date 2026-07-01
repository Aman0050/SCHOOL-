import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, UserPlus, CreditCard, Megaphone, FileText, CalendarPlus, Bus, Book } from 'lucide-react';

const actions = [
  { id: 1, label: 'Add Student', icon: <UserPlus className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10', hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/30', link: '/dashboard/students?tab=admissions&action=new' },
  { id: 2, label: 'Collect Fee', icon: <CreditCard className="w-5 h-5 text-primary" />, bg: 'bg-primary/10', hover: 'hover:bg-primary/20 hover:border-primary/30/30', link: '/dashboard/fees?tab=collections' },
  { id: 3, label: 'Notification', icon: <Megaphone className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-500/10', hover: 'hover:bg-amber-500/20 hover:border-amber-500/30', onClick: () => window.dispatchEvent(new CustomEvent('open-notifications')) },
  { id: 4, label: 'Add Exam', icon: <FileText className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-500/10', hover: 'hover:bg-rose-500/20 hover:border-rose-500/30', link: '/dashboard/examinations?tab=exams&action=new' },
  { id: 5, label: 'Schedule Class', icon: <CalendarPlus className="w-5 h-5 text-primary" />, bg: 'bg-primary/10', hover: 'hover:bg-primary/20 hover:border-primary/30/30', link: '/dashboard/academics?tab=classes' },
];

export const QuickActions: React.FC<any> = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden relative group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
      
      <div className="flex justify-between items-center mb-4 z-10">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500 mt-1">Frequently used shortcuts</p>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 z-10 overflow-y-auto custom-scrollbar pr-1">
        {actions.map(action => (
          action.link ? (
            <Link
              key={action.id}
              to={action.link}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border border-transparent transition-all duration-300 ${action.bg} ${action.hover} group/btn`}
            >
              <div className="mb-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover/btn:scale-110 transition-transform">
                {action.icon}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
                {action.label}
              </span>
            </Link>
          ) : (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border border-transparent transition-all duration-300 ${action.bg} ${action.hover} group/btn`}
            >
              <div className="mb-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover/btn:scale-110 transition-transform">
                {action.icon}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
                {action.label}
              </span>
            </button>
          )
        ))}
      </div>
    </div>
  );
};
