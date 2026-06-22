import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { MessageSquare, Mail, Download, AlertTriangle } from 'lucide-react';

export const DefaulterDashboard = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Defaulters Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage and communicate with students who have overdue fees.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-semibold">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-semibold shadow-sm">
            <MessageSquare className="h-4 w-4" /> Bulk WhatsApp
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex gap-4">
        <select className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option>All Classes</option>
          <option>Grade 10</option>
          <option>Grade 11</option>
          <option>Grade 12</option>
        </select>
        <select className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option>All Fee Categories</option>
          <option>Tuition Fee</option>
          <option>Transport Fee</option>
        </select>
        <select className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option>Any Due Date</option>
          <option>Overdue by 30+ Days</option>
          <option>Overdue by 90+ Days</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">Class</th>
              <th className="px-6 py-4 font-semibold">Overdue Amount</th>
              <th className="px-6 py-4 font-semibold">Due Date</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {/* Sample Data */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900 dark:text-white">Alex Johnson</div>
                <div className="text-xs">Admission: ADM-2023-014</div>
              </td>
              <td className="px-6 py-4">Grade 10 - A</td>
              <td className="px-6 py-4 font-bold text-red-500">₹14,500</td>
              <td className="px-6 py-4 text-amber-500">15 Aug 2026</td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10"><MessageSquare className="h-4 w-4" /></button>
                <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"><Mail className="h-4 w-4" /></button>
              </td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900 dark:text-white">Sarah Williams</div>
                <div className="text-xs">Admission: ADM-2022-089</div>
              </td>
              <td className="px-6 py-4">Grade 11 - B</td>
              <td className="px-6 py-4 font-bold text-red-500">₹8,000</td>
              <td className="px-6 py-4 text-amber-500">01 Sep 2026</td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10"><MessageSquare className="h-4 w-4" /></button>
                <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"><Mail className="h-4 w-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
