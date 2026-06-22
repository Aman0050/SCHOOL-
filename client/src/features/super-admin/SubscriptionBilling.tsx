import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { Receipt, FileText, Download, Loader2 } from 'lucide-react';

export const SubscriptionBilling: React.FC = () => {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['superAdminInvoices'],
    queryFn: () => superAdminApi.getInvoices()
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Billing & Revenue</h2>
          <p className="text-sm text-slate-400 mt-1">Manage global SaaS invoices and track payments.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-slate-700 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
           <h3 className="font-bold text-white flex items-center gap-2">
             <Receipt className="w-5 h-5 text-indigo-400" /> Recent Invoices
           </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Invoice ID</th>
                <th className="p-4">School</th>
                <th className="p-4">Plan / Details</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></td></tr>
              ) : invoices?.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-400">
                      {inv.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{inv.tenant.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-500/20">
                        {inv.subscription?.plan?.name || 'CUSTOM'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-white">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border ${
                        inv.status === 'PAID' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right text-xs text-slate-400 font-medium">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
