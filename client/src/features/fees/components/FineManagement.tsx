import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  IndianRupee,
  User,
} from 'lucide-react';
import { useFines, useCreateFine, useUpdateFine } from '../api/feeApi';
import type { FineType } from '../types/fee.types';

const fmt = (v: string | number) => `₹${parseFloat(String(v)).toLocaleString('en-IN')}`;

const fineTypeColors: Record<FineType, string> = {
  LATE_PAYMENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LIBRARY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DAMAGE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  DISCIPLINE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  OTHER: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const fineTypeLabels: Record<FineType, string> = {
  LATE_PAYMENT: 'Late Payment',
  LIBRARY: 'Library',
  DAMAGE: 'Damage',
  DISCIPLINE: 'Discipline',
  OTHER: 'Other',
};

interface FineFormData {
  studentId: string;
  type: FineType;
  amount: string;
  reason: string;
}

const FineManagement: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [showModal, setShowModal] = useState(false);

  const isPaidParam = filter === 'ALL' ? undefined : filter === 'PAID';
  const { data: fines, isLoading } = useFines({ isPaid: isPaidParam });
  const createMutation = useCreateFine();
  const updateMutation = useUpdateFine();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FineFormData>({
    defaultValues: { studentId: '', type: 'LATE_PAYMENT', amount: '', reason: '' },
  });

  const onSubmit = (data: FineFormData) => {
    createMutation.mutate(
      {
        studentId: data.studentId,
        type: data.type,
        amount: parseFloat(data.amount),
        reason: data.reason,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          reset();
        },
      }
    );
  };

  const markPaid = (id: string) => {
    updateMutation.mutate({ id, payload: { isPaid: true } });
  };

  const waiveFine = (id: string) => {
    if (window.confirm('Waive this fine?')) {
      updateMutation.mutate({ id, payload: { waivedBy: 'admin' } });
    }
  };

  const totalFines = fines?.reduce((acc, f) => acc + parseFloat(f.amount), 0) ?? 0;
  const collectedFines = fines?.filter((f) => f.isPaid).reduce((acc, f) => acc + parseFloat(f.amount), 0) ?? 0;
  const outstanding = totalFines - collectedFines;

  const inputCls =
    'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fine Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage student fines across categories.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Fine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Fines', value: totalFines, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Collected', value: collectedFines, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Outstanding', value: outstanding, icon: <IndianRupee className="h-5 w-5" />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 flex items-center gap-4 shadow-sm">
            <div className={`h-12 w-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{fmt(s.value)}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {(['ALL', 'UNPAID', 'PAID'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !fines?.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center py-16 gap-3">
                      <AlertTriangle className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">No fines recorded</p>
                    </div>
                  </td>
                </tr>
              ) : (
                fines.map((fine, idx) => (
                  <tr
                    key={fine.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors ${
                      idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-900/20' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-xs">
                            {fine.student?.firstName} {fine.student?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{fine.student?.admission?.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${fineTypeColors[fine.type]}`}>
                        {fineTypeLabels[fine.type]}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{fmt(fine.amount)}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{fine.reason}</td>
                    <td className="px-5 py-4">
                      {fine.isPaid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid
                        </span>
                      ) : fine.waivedBy ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 text-xs font-semibold">
                          Waived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 text-xs font-semibold">
                          <XCircle className="h-3 w-3" />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!fine.isPaid && !fine.waivedBy && (
                          <>
                            <button
                              onClick={() => markPaid(fine.id)}
                              disabled={updateMutation.isPending}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark Paid
                            </button>
                            <button
                              onClick={() => waiveFine(fine.id)}
                              disabled={updateMutation.isPending}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                            >
                              Waive
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Add Fine</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Student ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter student ID"
                  className={inputCls}
                  {...register('studentId', { required: true })}
                />
                {errors.studentId && <span className="text-xs text-red-500">Student ID is required</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fine Type <span className="text-red-500">*</span></label>
                  <select className={inputCls} {...register('type', { required: true })}>
                    {Object.entries(fineTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      placeholder="0.00"
                      className={`${inputCls} pl-8`}
                      {...register('amount', { required: true, min: 1 })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Brief description of the fine..."
                  className={inputCls}
                  {...register('reason', { required: true })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManagement;
