import React, { useState } from 'react';
import { User, Lock, Building2 } from 'lucide-react';
import { ProfileSettings } from './components/ProfileSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { SchoolDetailsSettings } from './components/SchoolDetailsSettings';

const SchoolSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Profile', icon: <User className="w-5 h-5" />, component: <ProfileSettings /> },
    { name: 'Security', icon: <Lock className="w-5 h-5" />, component: <SecuritySettings /> },
    { name: 'School Details', icon: <Building2 className="w-5 h-5" />, component: <SchoolDetailsSettings /> }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Settings</h2>
        <p className="text-slate-500 mt-2">Manage your school profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab, i) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(i)}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === i
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                {tab.name}
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <React.Suspense fallback={<div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-96 rounded-3xl" />}>
            {tabs[activeTab].component}
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default SchoolSettings;
