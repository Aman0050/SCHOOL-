import React, { useState } from 'react';
import { Search, User, CreditCard, Receipt, Wallet, Bell } from 'lucide-react';

export const FeeCollection = () => {
  const [search, setSearch] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Fee Collection Center</h2>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Student Name, Admission Number, or Parent Mobile..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-300 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white">Pending Installments</h3>
            </div>
            <div className="p-8 text-center text-slate-500">
              <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Search for a student to view their outstanding fee installments and process collections.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-md group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                    <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Generate Receipt
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-md group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                    <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Apply Discount
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-md group-hover:bg-amber-200 dark:group-hover:bg-amber-800 transition-colors">
                    <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Send Reminder
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeCollection;
