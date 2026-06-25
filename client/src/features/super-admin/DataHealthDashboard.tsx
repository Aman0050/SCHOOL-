import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, Activity, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

interface Anomaly {
  id: string;
  module: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  issueType: string;
  description: string;
  resolution: string;
  status: string;
  createdAt: string;
}

export const DataHealthDashboard = () => {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['data-health'],
    queryFn: () => api.get('/health/data-integrity').then(res => res.data.data),
  });

  const scanMutation = useMutation({
    mutationFn: () => api.post('/health/data-integrity/scan'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-health'] });
      setIsScanning(false);
    },
    onError: () => setIsScanning(false)
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/health/data-integrity/anomaly/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-health'] })
  });

  const handleScan = () => {
    setIsScanning(true);
    scanMutation.mutate();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Enterprise Data Scan...</div>;
  }

  const score = data?.score || 100;
  const anomalies: Anomaly[] = data?.anomalies || [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            Enterprise Data Integrity Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time health monitoring of relational data consistency.</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Running Deep Scan...' : 'Run Fast Scan Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Overall Data Health Score</div>
          <div className={`text-6xl font-black ${score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
            {score.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{anomalies.filter(a => a.severity === 'HIGH').length}</div>
            <div className="text-sm text-slate-500">Critical Anomalies</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{anomalies.length}</div>
            <div className="text-sm text-slate-500">Total Open Issues</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detected Anomalies</h2>
        </div>
        
        {anomalies.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
            <p className="text-lg font-medium text-slate-900 dark:text-white">System is completely healthy</p>
            <p>No relational or mathematical inconsistencies detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Module</th>
                <th className="px-6 py-3">Issue Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Suggested Resolution</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {anomalies.map((anomaly) => (
                <tr key={anomaly.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {anomaly.module}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${anomaly.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {anomaly.issueType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-300 font-medium">{anomaly.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{anomaly.resolution}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => resolveMutation.mutate(anomaly.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Mark Resolved
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};
