import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { ShieldAlert, Search, Filter, Loader2, Download } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['superAdminAuditLogs'],
    queryFn: () => superAdminApi.getAuditLogs()
  });

  const filteredLogs = logs?.filter(log => 
    (filterAction === 'ALL' || log.action === filterAction) &&
    (log.entity.toLowerCase().includes(searchTerm.toLowerCase()) || 
     log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security & Audit Logs</h2>
          <p className="text-sm text-slate-400 mt-1">Track every action taken across all tenants for security compliance.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-slate-700 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/50">
           <div className="relative w-full sm:w-96">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search by entity or email..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full bg-slate-900 border border-slate-800 text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-600"
             />
           </div>
           <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={filterAction} 
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
              </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
                <th className="p-4 text-right pr-6">IP / Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></td></tr>
              ) : filteredLogs?.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">No audit logs match criteria.</td></tr>
              ) : (
                filteredLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 pl-6 text-xs text-slate-400 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-300">
                          {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{log.user?.email || 'System'}</p>
                          <p className="text-[10px] text-slate-500">{log.tenant?.name || 'Global'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-400' :
                        log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.action === 'LOGIN' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-indigo-300">
                      {log.entity} <span className="text-slate-600 text-xs">({log.entityId?.substring(0, 8)})</span>
                    </td>
                    <td className="p-4 pr-6 text-right text-xs text-slate-500 font-mono">
                      {log.ipAddress || '127.0.0.1'}
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
