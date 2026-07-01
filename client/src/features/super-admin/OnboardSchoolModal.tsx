import React, { useState } from 'react';
import { X, Building2, User, Mail, Lock, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import toast from 'react-hot-toast';

interface OnboardSchoolModalProps {
  onClose: () => void;
}

export const OnboardSchoolModal: React.FC<OnboardSchoolModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    domain: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const createTenantMutation = useMutation({
    mutationFn: (data: typeof formData) => superAdminApi.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminTenants'] });
      toast.success('School onboarded successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to onboard school');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenantMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Onboard New School
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* School Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">School Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">School Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Greenwood High"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Subdomain</label>
                <div className="flex">
                  <input 
                    type="text" required
                    value={formData.subdomain} onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    className="w-full bg-slate-950 border border-slate-800 border-r-0 text-white rounded-l-xl px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none" 
                    placeholder="e.g. greenwood"
                  />
                  <span className="bg-slate-800 border border-slate-800 text-slate-400 px-3 py-2.5 rounded-r-xl text-sm flex items-center">
                    .edusphere.com
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Custom Domain (Optional)</label>
                <input 
                  type="text"
                  value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. greenwoodhigh.edu"
                />
              </div>
            </div>
          </div>

          {/* Admin User Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Primary Admin User</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" required
                    value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                <input 
                  type="text" required
                  value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" required
                    value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Initial Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" required minLength={8}
                    value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createTenantMutation.isPending}
              className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
            >
              {createTenantMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Onboard School
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
