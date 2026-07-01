import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Layers, IndianRupee, FileText, AlertTriangle } from 'lucide-react';
import { AccountantDashboard } from './components/AccountantDashboard';
import FeeStructures from './components/FeeStructures';
import FeeCategories from './components/FeeCategories';
import FeeCollection from './components/FeeCollection';
import FineManagement from './components/FineManagement';
import { DefaulterDashboard } from './components/DefaulterDashboard';

export const FeeManagement = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Fee Management</h1>
          <p className="text-sm text-slate-500">Enterprise fee collection, installments, and financial reporting.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-6 hide-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'collections'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <IndianRupee className="h-4 w-4" />
          Fee Collection
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'structures'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Fee Structures
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('fines')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'fines'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Fines & Late Fees
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'defaulters'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Defaulters
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'dashboard' && <AccountantDashboard />}
        {activeTab === 'collections' && <FeeCollection />}
        {activeTab === 'defaulters' && <DefaulterDashboard />}
        {activeTab === 'structures' && <FeeStructures />}
        {activeTab === 'categories' && <FeeCategories />}
        {activeTab === 'fines' && <FineManagement />}
      </div>
    </div>
  );
};

export default FeeManagement;
