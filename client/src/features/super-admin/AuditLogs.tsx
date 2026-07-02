import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { ShieldAlert, Search, Filter, Loader2, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

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

  const handleExport = async () => {
    if (!filteredLogs || filteredLogs.length === 0) return;
    
    const formattedData = filteredLogs.map((log: any) => ({
      timestamp: new Date(log.createdAt).toLocaleString(),
      email: log.user?.email || 'System',
      name: `${log.user?.firstName || ''} ${log.user?.lastName || ''}`.trim(),
      tenant: log.tenant?.name || 'Global',
      action: log.action,
      resource: `${log.entity} (${log.entityId || ''})`,
      ip: log.ipAddress || '::1'
    }));
    
    await exportToExcel({
      filename: 'eduxeno-audit-logs.xlsx',
      sheetName: 'Audit Logs',
      title: 'EduXeno Security & Audit Logs',
      subtitle: `Generated on ${new Date().toLocaleString()} | Filter: ${filterAction}`,
      data: formattedData,
      columns: [
        { header: 'Timestamp', key: 'timestamp', width: 25 },
        { header: 'User Email', key: 'email', width: 30 },
        { header: 'User Name', key: 'name', width: 25 },
        { header: 'Tenant', key: 'tenant', width: 25 },
        { header: 'Action', key: 'action', width: 20 },
        { header: 'Resource', key: 'resource', width: 35 },
        { header: 'IP Address', key: 'ip', width: 18 }
      ]
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Audit Logs</h2>
          <p className="text-sm text-slate-400 mt-1">Track every action taken across all tenants for security compliance.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
           <div className="relative w-full sm:w-96">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search by entity or email..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary outline-none placeholder-slate-400"
             />
           </div>
           <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={filterAction} 
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
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
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
                <th className="p-4 text-right pr-6">IP / Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></td></tr>
              ) : filteredLogs?.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">No audit logs match criteria.</td></tr>
              ) : (
                filteredLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">
                          {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.user?.email || 'System'}</p>
                          <p className="text-[10px] text-slate-500">{log.tenant?.name || 'Global'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        log.action === 'DELETE' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        log.action === 'LOGIN' ? 'bg-primary/10 text-primary border border-primary/20' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      {log.entity} <span className="text-slate-400 text-xs">({log.entityId?.substring(0, 8)})</span>
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
