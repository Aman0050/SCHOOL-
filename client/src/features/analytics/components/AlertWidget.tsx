import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertWidgetProps {
  alerts: Array<{ id: string, type: string, severity: string, message: string, isRead: boolean }>;
}

export const AlertWidget: React.FC<AlertWidgetProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Alerts</h3>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length} Active</span>
      </div>
      
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-sm ${
            alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-500' :
            alert.severity === 'WARNING' ? 'bg-amber-50 border-amber-500' :
            'bg-blue-50 border-blue-500'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {alert.severity === 'CRITICAL' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {alert.severity === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            {alert.severity === 'INFO' && <Info className="w-5 h-5 text-blue-500" />}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${
              alert.severity === 'CRITICAL' ? 'text-red-900' :
              alert.severity === 'WARNING' ? 'text-amber-900' :
              'text-blue-900'
            }`}>
              {alert.type} ALERT
            </p>
            <p className={`text-sm mt-0.5 ${
              alert.severity === 'CRITICAL' ? 'text-red-800' :
              alert.severity === 'WARNING' ? 'text-amber-800' :
              'text-blue-800'
            }`}>
              {alert.message}
            </p>
          </div>
          <button className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors">
            <X className={`w-4 h-4 ${
              alert.severity === 'CRITICAL' ? 'text-red-400' :
              alert.severity === 'WARNING' ? 'text-amber-400' :
              'text-blue-400'
            }`} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertWidget;
