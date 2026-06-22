import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { History, User, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/academics/audit-logs').then((res) => res.data.data),
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionBadge = (action: string) => {
    const base = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ';
    switch (action) {
      case 'LOGIN':
        return base + 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'CREATE':
        return base + 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'UPDATE':
        return base + 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'DELETE':
        return base + 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return base + 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Audit Logs
        </h1>
        <p className="text-sm text-slate-500">
          Trace security and modification activity across the entire school tenant database.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity type</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {logs?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No security audit events captured yet.
                    </td>
                  </tr>
                ) : (
                  logs?.map((log: any) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={() => toggleExpand(log.id)}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 text-center">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System Session'}
                                </p>
                                <p className="text-xs text-slate-500">{log.user?.email || 'automated-task@saas'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900 dark:text-white">{log.entity}</span>
                            <span className="text-slate-500 block text-xs truncate max-w-[120px]">
                              ID: {log.entityId || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {log.ipAddress || 'unknown'}
                          </td>
                        </tr>

                        {/* Expandable JSON Detail Block */}
                        {isExpanded && (
                          <tr className="bg-slate-50/40 dark:bg-slate-900/20">
                            <td colSpan={6} className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                              <div className="space-y-3 p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-850 font-mono text-xs overflow-x-auto shadow-inner">
                                <div className="flex items-center gap-2 text-primary border-b border-slate-800 pb-2 mb-2 font-bold uppercase tracking-wider">
                                  <Terminal className="h-4 w-4" />
                                  Database State Delta Details
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-slate-500 font-bold mb-1">// Old State</p>
                                    <pre className="whitespace-pre-wrap max-h-40 overflow-y-auto">
                                      {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : 'null (Created)'}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-primary font-bold mb-1">// New State</p>
                                    <pre className="whitespace-pre-wrap max-h-40 overflow-y-auto">
                                      {log.newValues ? JSON.stringify(log.newValues, null, 2) : 'null (Deleted)'}
                                    </pre>
                                  </div>
                                </div>
                                <div className="border-t border-slate-800 pt-2 mt-2 text-[10px] text-slate-500 flex justify-between">
                                  <span>Log Audit UID: {log.id}</span>
                                  <span>Client Agent: {log.userAgent || 'Unknown Agent'}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsView;
