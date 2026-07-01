import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { Building2, Search, Filter, Loader2 } from 'lucide-react';
import { OnboardSchoolModal } from './OnboardSchoolModal';
import { SchoolDetailsModal } from './SchoolDetailsModal';
import { useVirtualizer } from '@tanstack/react-virtual';

export const SchoolsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const { data: schools, isLoading } = useQuery({
    queryKey: ['superAdminTenants'],
    queryFn: () => superAdminApi.getTenants()
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => superAdminApi.updateTenantStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminTenants'] });
    }
  });

  const filteredSchools = schools?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const rowVirtualizer = useVirtualizer({
    count: filteredSchools.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // Expected row height
    overscan: 5,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Schools Management</h2>
          <p className="text-sm text-slate-400 mt-1">Manage onboarded schools, domains, and access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
        >
          + Onboard New School
        </button>
      </div>

      {isModalOpen && <OnboardSchoolModal onClose={() => setIsModalOpen(false)} />}
      {selectedSchool && <SchoolDetailsModal school={selectedSchool} onClose={() => setSelectedSchool(null)} />}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[700px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0 bg-white">
           <div className="relative w-full sm:w-96">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search by name or subdomain..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary outline-none placeholder-slate-400"
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors border border-slate-200">
             <Filter className="w-4 h-4" /> Filter
           </button>
        </div>

        {/* Header */}
        <div className="flex bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold shrink-0 pr-2">
          <div className="flex-[2] p-4 pl-6">School Details</div>
          <div className="flex-[1.5] p-4">Domain/Subdomain</div>
          <div className="flex-[1.5] p-4">Plan & Status</div>
          <div className="flex-1 p-4 text-center">Users</div>
          <div className="flex-1 p-4 text-center">Created</div>
          <div className="flex-1 p-4 text-right pr-6">Actions</div>
        </div>

        {/* Virtualized Body */}
        <div ref={parentRef} className="flex-1 overflow-auto custom-scrollbar relative">
          {isLoading ? (
            <div className="p-12 text-center h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="p-12 text-center text-slate-500 h-full flex items-center justify-center">No schools found.</div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const school = filteredSchools[virtualRow.index] as any;
                return (
                  <div
                    key={school.id}
                    onClick={() => setSelectedSchool(school)}
                    className="flex items-center hover:bg-slate-50 cursor-pointer transition-colors group absolute top-0 left-0 w-full border-b border-slate-100"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="flex-[2] p-4 pl-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-sm truncate">{school.name}</p>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                          {school.isActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> : <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>}
                          {school.isActive ? 'Active Access' : 'Suspended'}
                        </p>
                      </div>
                    </div>
                    <div className="flex-[1.5] p-4 truncate">
                      <p className="text-sm text-indigo-600 font-medium truncate">{school.subdomain}.edusphere.com</p>
                      {school.domain && <p className="text-xs text-slate-500 mt-0.5 truncate">{school.domain}</p>}
                    </div>
                    <div className="flex-[1.5] p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                          {school.subscription?.plan?.name || 'TRIAL'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                           school.subscription?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {school.subscription?.status || 'TRIAL'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 text-center">
                      <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm border border-slate-200">
                        {school._count?.users || 0}
                      </span>
                    </div>
                    <div className="flex-1 p-4 text-center text-xs text-slate-400 font-medium truncate">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex-1 p-4 pr-6 text-right relative flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatusMutation.mutate({ id: school.id, isActive: !school.isActive });
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                          school.isActive 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={school.isActive ? 'Suspend School' : 'Activate School'}
                      >
                        {toggleStatusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : school.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
