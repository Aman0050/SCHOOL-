import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  IndianRupee,
  BadgePercent,
  Receipt,
  Clock,
  CheckCircle2,
  Loader2,
  Search,
  Wallet,
} from 'lucide-react';
import {
  useStudentAssignments,
  useDiscounts,
  useApplyDiscount,
} from '../api/feeApi';
import type { StudentFeeAssignment, FeeCollection } from '../types/fee.types';

const fmt = (v: string | number) => `₹${parseFloat(String(v)).toLocaleString('en-IN')}`;

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    PARTIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PENDING: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    WAIVED: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  };
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? map.PENDING}`;
};

interface ApplyDiscountFormData {
  discountId: string;
  remarks: string;
}

const DiscountModal: React.FC<{
  assignmentId: string;
  onClose: () => void;
}> = ({ assignmentId, onClose }) => {
  const { data: discounts } = useDiscounts();
  const applyMutation = useApplyDiscount();
  const { register, handleSubmit } = useForm<ApplyDiscountFormData>();

  const onSubmit = (data: ApplyDiscountFormData) => {
    applyMutation.mutate(
      { assignmentId, discountId: data.discountId, remarks: data.remarks },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgePercent className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">Apply Discount</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Select Discount</label>
            <select
              {...register('discountId', { required: true })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            >
              <option value="">-- Choose Discount --</option>
              {discounts?.filter((d) => d.isActive).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.type === 'PERCENTAGE' ? `${d.value}%` : fmt(d.value)})
                  {d.isScholarship ? ' 🎓' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Remarks</label>
            <input
              type="text"
              placeholder="Reason for discount..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              {...register('remarks')}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentTimeline: React.FC<{ collections: FeeCollection[] }> = ({ collections }) => {
  if (!collections?.length) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="text-slate-500 text-sm">No payment history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {collections.map((col, idx) => (
        <div key={col.id} className="flex gap-4 items-start relative">
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
              col.status === 'PAID'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
            }`}>
              {col.status === 'PAID' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </div>
            {idx < collections.length - 1 && (
              <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1 mb-1" style={{ minHeight: '24px' }} />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Receipt #{col.receiptNumber}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(col.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {col.collectedByUser && ` · by ${col.collectedByUser.firstName} ${col.collectedByUser.lastName}`}
                </p>
                {col.payments?.map((p) => (
                  <span key={p.id} className="mr-2 mt-1 inline-block text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">
                    {p.method}
                    {p.transactionId ? ` · ${p.transactionId}` : ''}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-slate-900 dark:text-white">{fmt(col.paidAmount)}</p>
                <span className={statusBadge(col.status)}>{col.status}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const StudentFeeProfile: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<StudentFeeAssignment | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const { data: assignments, isLoading } = useStudentAssignments(studentId);

  const handleSearch = () => {
    setStudentId(searchId.trim());
    setSelectedAssignment(null);
  };

  const assignment = selectedAssignment ?? assignments?.[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Fee Profile</h2>
        <p className="text-sm text-slate-500 mt-0.5">View complete fee history and apply discounts per student.</p>
      </div>

      {/* Student Search */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Student ID or Admission Number"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all"
          >
            Search
          </button>
        </div>

        {/* Assignment Tabs */}
        {assignments && assignments.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {assignments.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAssignment(a)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  (selectedAssignment?.id ?? assignments[0].id) === a.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary/10'
                }`}
              >
                {a.feeStructure?.name} · {a.academicYear}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {studentId && !isLoading && !assignments?.length && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 flex flex-col items-center gap-3">
          <User className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 font-medium">No fee records found for this student.</p>
        </div>
      )}

      {assignment && (
        <>
          {/* Student Header */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 shadow-sm flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {assignment.student.firstName} {assignment.student.lastName}
              </h3>
              <p className="text-sm text-slate-500">
                {assignment.student.admission?.admissionNumber} · {assignment.student.email}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{assignment.feeStructure?.name} · {assignment.academicYear}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={statusBadge(assignment.status)}>{assignment.status}</span>
              <button
                onClick={() => setShowDiscountModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary hover:bg-purple-200 dark:hover:bg-purple-900/50 px-4 py-2.5 text-sm font-semibold transition-all"
              >
                <BadgePercent className="h-4 w-4" />
                Apply Discount
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Total Assigned', value: assignment.totalAmount, icon: <Wallet className="h-5 w-5" />, color: 'text-primary dark:text-primary', bg: 'bg-primary/10 dark:bg-primary/20' },
              { label: 'Amount Paid', value: assignment.paidAmount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
              { label: 'Discount', value: assignment.discountAmount, icon: <BadgePercent className="h-5 w-5" />, color: 'text-primary dark:text-primary', bg: 'bg-primary/10 dark:bg-primary/20' },
              { label: 'Amount Due', value: assignment.dueAmount, icon: <IndianRupee className="h-5 w-5" />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
              { label: 'Fines', value: assignment.fineAmount, icon: <Receipt className="h-5 w-5" />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 flex flex-col gap-2 shadow-sm">
                <div className={`h-9 w-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                  {s.icon}
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{fmt(s.value)}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Applied Discounts */}
          {assignment.discounts?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <BadgePercent className="h-4 w-4 text-primary" />
                  Applied Discounts
                </h3>
              </div>
              <div className="p-5 space-y-2">
                {assignment.discounts.map((sd) => (
                  <div key={sd.id} className="flex items-center justify-between p-3 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/30">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{sd.discount.name}</p>
                      {sd.remarks && <p className="text-xs text-slate-500">{sd.remarks}</p>}
                    </div>
                    <span className="text-sm font-bold text-primary dark:text-primary">-{fmt(sd.appliedAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Timeline */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Payment History
              </h3>
            </div>
            <div className="p-5">
              <PaymentTimeline collections={assignment.collections ?? []} />
            </div>
          </div>
        </>
      )}

      {showDiscountModal && assignment && (
        <DiscountModal
          assignmentId={assignment.id}
          onClose={() => setShowDiscountModal(false)}
        />
      )}
    </div>
  );
};

export default StudentFeeProfile;
