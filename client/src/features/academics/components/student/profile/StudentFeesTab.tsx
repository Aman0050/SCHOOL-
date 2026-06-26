import React from 'react';
import { IndianRupee, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentFeesTabProps {
  student: any;
}

export const StudentFeesTab: React.FC<StudentFeesTabProps> = ({ student }) => {
  const { feeAssignments = [] } = student;

  if (feeAssignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center">
          <IndianRupee className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No Fee Records Found</p>
        <p className="text-sm mt-2">Any billed invoices or fee ledgers will appear here.</p>
      </div>
    );
  }

  // Calculate totals
  const totalBilled = feeAssignments.reduce((acc: number, fee: any) => acc + Number(fee.totalAmount || 0), 0);
  const totalPaid = feeAssignments.reduce((acc: number, fee: any) => acc + Number(fee.paidAmount || 0), 0);
  const balanceDue = feeAssignments.reduce((acc: number, fee: any) => acc + Number(fee.dueAmount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-500/10 rounded-xl">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Billed</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalBilled)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 rounded-xl">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Paid</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalPaid)}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-md transform hover:scale-[1.02] transition-transform flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-red-100 text-sm font-medium">Balance Due</p>
            <h3 className="text-3xl font-bold">{formatCurrency(balanceDue)}</h3>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Fee Assignments</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Fee Structure</th>
                <th className="px-6 py-4 font-semibold">Academic Year</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Paid Amount</th>
                <th className="px-6 py-4 font-semibold">Due Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {feeAssignments.map((fee: any) => {
                const isPaid = fee.status === 'PAID';
                return (
                  <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                      {fee.feeStructure?.name || 'Standard Fee'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {fee.academicYear}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(Number(fee.totalAmount))}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      {formatCurrency(Number(fee.paidAmount))}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-500">
                      {formatCurrency(Number(fee.dueAmount))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isPaid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
