import React, { useState } from 'react';
import { X, Building2, Users, Calendar, Link as LinkIcon, Activity, CheckCircle2, XCircle, Database, Shield, Edit2, Trash2, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { EditSchoolModal } from './EditSchoolModal';

interface SchoolDetailsModalProps {
  school: any;
  onClose: (updatedPassword?: { userId: string, password: string }) => void;
}

export const SchoolDetailsModal: React.FC<SchoolDetailsModalProps> = ({ school, onClose }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});

  const deleteMutation = useMutation({
    mutationFn: () => superAdminApi.deleteTenant(school.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin_tenants'] });
      onClose();
    }
  });

  if (!school) return null;

  const handleEditClose = (updatedPassword?: { userId: string, password: string }) => {
    setIsEditing(false);
    if (updatedPassword) {
      setTempPasswords(prev => ({ ...prev, [updatedPassword.userId]: updatedPassword.password }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {isEditing && <EditSchoolModal school={school} onClose={handleEditClose} />}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
        
        {/* Header */}
        <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{school.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                {school.isActive ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> Suspended
                  </span>
                )}
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Database className="w-3.5 h-3.5 text-slate-400" /> ID: <span className="text-slate-700 font-mono">{school.id.split('-')[0]}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showDeleteConfirm ? (
              <>
                <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-600 transition-all bg-white hover:bg-indigo-50 p-2.5 rounded-xl border border-slate-200 hover:border-indigo-200 shadow-sm" title="Edit School">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="text-slate-400 hover:text-rose-600 transition-all bg-white hover:bg-rose-50 p-2.5 rounded-xl border border-slate-200 hover:border-rose-200 shadow-sm" title="Delete School">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => onClose()} className="text-slate-400 hover:text-slate-700 transition-all bg-white hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200 shadow-sm ml-2">
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Delete permanently?
                </span>
                <button onClick={() => setShowDeleteConfirm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1">Cancel</button>
                <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-lg flex items-center gap-2 shadow-sm">
                  {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-white">
          
          {/* Top Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-300 transition-colors shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-12 h-12 text-indigo-600" />
              </div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Total Users</div>
              <div className="text-3xl font-extrabold text-slate-900 relative z-10">{school._count?.users || 0}</div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-300 transition-colors shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Campuses</div>
              <div className="text-3xl font-extrabold text-slate-900 relative z-10">{school.schools?.length || 0}</div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl col-span-2 md:col-span-2 relative overflow-hidden group hover:border-amber-300 transition-colors shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-12 h-12 text-amber-600" />
              </div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Registered On</div>
              <div className="text-2xl font-extrabold text-slate-900 truncate relative z-10">
                {new Date(school.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Network Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
              </div>
              Network & Routing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">System Subdomain</p>
                <div className="text-sm text-indigo-600 font-semibold truncate font-mono">
                  {school.subdomain}.edusphere.com
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Custom Domain</p>
                <div className="text-sm text-slate-700 font-semibold truncate font-mono">
                  {school.domain || <span className="text-slate-400 italic font-sans">Not configured</span>}
                </div>
              </div>
            </div>
          </div>

          {/* School Admin Contacts */}
          {school.users && school.users.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                School Admin Access
              </h3>
              
              <div className="space-y-4">
                {school.users.map((user: any) => (
                  <div key={user.id} className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-500 font-medium">{user.id.split('-')[0]}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100">
                        Primary Admin
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 relative shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Login ID (Email)</p>
                        <p className="text-sm text-slate-700 font-semibold font-mono">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Password</p>
                        {tempPasswords[user.id] ? (
                          <p className="text-sm text-emerald-600 font-bold font-mono tracking-widest bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                            {tempPasswords[user.id]}
                          </p>
                        ) : (
                          <p className="text-lg text-slate-300 font-medium tracking-[0.2em] mt-1 leading-none">••••••••</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subscription Plan</h3>
                  <p className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700 mt-0.5">
                    {school.subscription?.plan?.name || 'Enterprise Trial'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl border ${
                    school.subscription?.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${school.subscription?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                    {school.subscription?.status || 'TRIAL'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
