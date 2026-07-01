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

  const handleExport = () => {
    const headers = ['Invoice ID', 'School', 'Plan', 'Amount', 'Status', 'Date'];
    const csvData = (invoices || []).map((inv: any) => [
      inv.id.split('-')[0].toUpperCase(),
      `"${inv.tenant?.name || 'Unknown'}"`,
      `"${inv.subscription?.plan?.name || 'CUSTOM'}"`,
      inv.amount,
      inv.status,
      new Date(inv.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'eduxeno-billing-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Revenue</h2>
          <p className="text-sm text-slate-400 mt-1">Manage global SaaS invoices and track payments.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
           <h3 className="font-bold text-slate-900 flex items-center gap-2">
             <Receipt className="w-5 h-5 text-indigo-400" /> Recent Invoices
           </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Invoice ID</th>
                <th className="p-4">School</th>
                <th className="p-4">Plan / Details</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></td></tr>
              ) : invoices?.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-400">
                      {inv.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{inv.tenant.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/20">
                        {inv.subscription?.plan?.name || 'CUSTOM'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border ${
                        inv.status === 'PAID' 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
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
