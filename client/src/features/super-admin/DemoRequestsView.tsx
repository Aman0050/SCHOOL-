import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { DemoRequestModal } from './DemoRequestModal';

export const DemoRequestsView: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['superAdminDemoRequests'],
    queryFn: () => superAdminApi.getDemoRequests()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => superAdminApi.updateDemoRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminDemoRequests'] });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status')
  });

  if (isLoading) {
    return <div className="p-8 text-slate-500">Loading demo requests...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <DemoRequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Demo Requests</h1>
        <p className="text-slate-400">Manage incoming inquiries and demo bookings from the marketing site.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prospect</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Institution</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req: any) => (
                <tr 
                  key={req.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedRequest(req)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{format(new Date(req.createdAt), 'MMM d, yyyy')}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{format(new Date(req.createdAt), 'h:mm a')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{req.fullName}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="w-3 h-3" /> {req.email}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone className="w-3 h-3" /> {req.phoneNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{req.institutionName}</div>
                    {req.message && (
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px] truncate" title={req.message}>
                        "{req.message}"
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {req.studentsCount} Students
                    </span>
                    <span className="block text-xs text-slate-400 mt-1 font-medium">
                      {req.campusesCount} Campus(es)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={req.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: req.id, status: e.target.value })}
                      className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 border outline-none cursor-pointer transition-colors ${
                        req.status === 'NEW' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                        req.status === 'CONTACTED' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      <option value="NEW" className="bg-white text-amber-600">NEW</option>
                      <option value="CONTACTED" className="bg-white text-primary">CONTACTED</option>
                      <option value="CLOSED" className="bg-white text-emerald-600">CLOSED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No demo requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DemoRequestsView;
