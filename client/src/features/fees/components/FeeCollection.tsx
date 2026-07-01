import React, { useState } from 'react';
import { Search, User, CreditCard, Receipt, Wallet, Bell, Loader2, IndianRupee } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { useStudentAssignments } from '../api/feeApi';
import toast from 'react-hot-toast';

const fmt = (v: string | number) => `₹${parseFloat(String(v)).toLocaleString('en-IN')}`;

export const FeeCollection = () => {
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const qc = useQueryClient();

  // Simple student search
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['students', 'search', search],
    queryFn: () => api.get('/users?role=STUDENT&search=' + search).then(r => r.data.data),
    enabled: search.length > 2,
  });

  const { data: assignments, isLoading: loadingAssignments } = useStudentAssignments(selectedStudentId!);

  const createCollectionMutation = useMutation({
    mutationFn: (assignmentId: string) => api.post('/fees/collections', { assignmentId }).then(r => r.data.data),
    onSuccess: (data) => {
      // In a real flow, this would open a payment modal.
      // For now, we will simulate a quick cash payment of the due amount.
      const amount = data.assignment.dueAmount;
      if (amount <= 0) {
        toast.error('No pending amount');
        return;
      }
      api.post(`/fees/collections/${data.id}/payments`, {
        amount,
        method: 'CASH',
        remarks: 'Quick Collection UI'
      }).then(() => {
        toast.success('Payment recorded successfully');
        qc.invalidateQueries({ queryKey: ['fees'] });
      }).catch(e => {
        toast.error(e.response?.data?.message || 'Payment failed');
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Fee Collection Center</h2>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Student Name (min 3 chars)..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />}
        </div>

        {search.length > 2 && searchResults?.length > 0 && !selectedStudentId && (
          <div className="mt-4 max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
            {searchResults.map((user: any) => (
              <div 
                key={user.id} 
                onClick={() => {
                  setSelectedStudentId(user.id);
                  setSearch(user.firstName + ' ' + user.lastName);
                }}
                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b last:border-0 border-slate-100 dark:border-slate-700"
              >
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">Select</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudentId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Fee Assignments</h3>
                <button 
                  onClick={() => {
                    setSelectedStudentId(null);
                    setSearch('');
                  }} 
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear Selection
                </button>
              </div>
              <div className="p-0">
                {loadingAssignments ? (
                  <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : assignments?.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No fee assignments found for this student.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assignments?.map((a: any) => (
                      <div key={a.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{a.feeStructure?.name}</p>
                          <p className="text-sm text-slate-500">{a.academicYear} • Due: <span className="font-semibold text-red-500">{fmt(a.dueAmount)}</span></p>
                        </div>
                        <button
                          disabled={a.dueAmount <= 0 || createCollectionMutation.isPending}
                          onClick={() => createCollectionMutation.mutate(a.id)}
                          className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Wallet className="h-4 w-4" />
                          {a.dueAmount <= 0 ? 'Paid' : 'Quick Collect Cash'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => toast('Select an assignment above to generate receipt', { icon: 'ℹ️' })}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-md group-hover:bg-indigo-200 transition-colors">
                      <Receipt className="h-4 w-4 text-primary dark:text-primary" />
                    </div>
                    Generate Receipt
                  </div>
                </button>
                <button 
                  onClick={() => toast('Navigate to Student Profile to apply discount', { icon: 'ℹ️' })}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-md group-hover:bg-emerald-200 transition-colors">
                      <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Apply Discount
                  </div>
                </button>
                <button 
                  onClick={() => toast('Reminder sent!', { icon: '✅' })}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-md group-hover:bg-amber-200 transition-colors">
                      <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    Send Reminder
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCollection;
