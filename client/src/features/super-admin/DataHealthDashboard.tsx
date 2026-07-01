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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            Enterprise Data Integrity Center
          </h1>
          <p className="text-slate-400 mt-1">Real-time health monitoring of relational data consistency.</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Running Deep Scan...' : 'Run Fast Scan Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-slate-400 mb-2">Overall Data Health Score</div>
          <div className={`text-6xl font-black ${score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
            {score.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{anomalies.filter(a => a.severity === 'HIGH').length}</div>
            <div className="text-sm text-slate-400">Critical Anomalies</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-blue-500">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{anomalies.length}</div>
            <div className="text-sm text-slate-400">Total Open Issues</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Detected Anomalies
          </h2>
        </div>
        
        {anomalies.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
            <p className="text-lg font-bold text-slate-900">System is completely healthy</p>
            <p>No relational or mathematical inconsistencies detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 pl-6">Module</th>
                <th className="px-6 py-4">Issue Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Suggested Resolution</th>
                <th className="px-6 py-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {anomalies.map((anomaly) => (
                <tr key={anomaly.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 pl-6">
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700">
                      {anomaly.module}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border ${anomaly.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                      {anomaly.issueType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold">{anomaly.description}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{anomaly.resolution}</td>
                  <td className="px-6 py-4 text-right pr-6">
                    <button 
                      onClick={() => resolveMutation.mutate(anomaly.id)}
                      className="bg-primary hover:bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Resolve
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
