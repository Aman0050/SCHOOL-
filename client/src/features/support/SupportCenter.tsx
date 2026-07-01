import React, { useState } from 'react';
import { LayoutDashboard, Ticket, BookOpen } from 'lucide-react';
import { SupportDashboard } from './components/SupportDashboard';
import { TicketSystem } from './components/TicketSystem';
import { KnowledgeBase } from './components/KnowledgeBase';

const SupportCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, component: <SupportDashboard /> },
    { name: 'My Tickets', icon: <Ticket className="w-5 h-5" />, component: <TicketSystem /> },
    { name: 'Knowledge Base', icon: <BookOpen className="w-5 h-5" />, component: <KnowledgeBase /> }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Support & Help Center</h2>
        <p className="text-slate-500 mt-2">Get help, report issues, and find answers to common questions.</p>
      </div>

      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map((tab, i) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors relative ${
              activeTab === i
                ? 'text-primary dark:text-primary'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.name}
            {activeTab === i && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-indigo-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="pt-2">
        <React.Suspense fallback={<div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-96 rounded-3xl" />}>
          {tabs[activeTab].component}
        </React.Suspense>
      </div>
    </div>
  );
};

export default SupportCenter;
