import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, CheckCircle, XCircle, AlertCircle, TrendingUp, IndianRupee, Clock, User as UserIcon } from 'lucide-react';

interface PreviewData {
  attendancePercentage: number;
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  totalPendingFees: number;
  classInfo: string;
  latestResult: {
    examName: string;
    grade: string;
    percentage: number;
  } | null;
}

interface StudentPreviewCardProps {
  studentId: string;
  className?: string;
}

export const StudentPreviewCard: React.FC<StudentPreviewCardProps> = ({ studentId, className = '' }) => {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.get(`/students/${studentId}/preview`)
      .then((res) => {
        if (isMounted) {
          setData(res.data.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  if (loading) {
    return (
      <div className={`p-4 flex items-center justify-center h-48 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`p-5 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/50 dark:to-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm ${className}`}>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Quick Overview</h3>
      
      <div className="space-y-4">
        {/* Class Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <UserIcon className="w-4 h-4 mr-2" />
            <span>Class</span>
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-200">{data.classInfo}</span>
        </div>

        {/* Attendance */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>Attendance</span>
          </div>
          <div className="flex items-center">
            <span className={`font-semibold ${data.attendancePercentage < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {data.attendancePercentage}%
            </span>
          </div>
        </div>

        {/* Fees */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <IndianRupee className="w-4 h-4 mr-2" />
            <span>Fees</span>
          </div>
          <div className="flex items-center">
            {data.feeStatus === 'PAID' && <span className="text-emerald-600 font-medium flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Paid</span>}
            {data.feeStatus === 'PENDING' && <span className="text-amber-600 font-medium flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> ₹{data.totalPendingFees}</span>}
            {data.feeStatus === 'OVERDUE' && <span className="text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> ₹{data.totalPendingFees}</span>}
          </div>
        </div>

        {/* Latest Result */}
        {data.latestResult && (
          <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>{data.latestResult.examName}</span>
            </div>
            <span className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-xs">
              {data.latestResult.grade} ({data.latestResult.percentage}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
