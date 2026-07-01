import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { AlertCircle, FileText, CalendarClock, DollarSign, Users, AlertTriangle } from 'lucide-react';

export const CriticalAction: React.FC<any> = () => {
  const { data: aggregateData, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard-aggregate'],
    queryFn: () => api.get('/analytics/dashboard-aggregate').then(res => res.data.data),
  });

  if (isLoading) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  const alerts = aggregateData?.alerts?.alerts || [];

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case 'FEE_DEFAULT_RISK': return <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />;
      case 'ATTENDANCE_PENDING':
      case 'TEACHER_MISSING': return <CalendarClock className="h-6 w-6 sm:h-8 sm:w-8" />;
      case 'APPROVAL_PENDING': return <FileText className="h-6 w-6 sm:h-8 sm:w-8" />;
      case 'AT_RISK_STUDENTS': return <Users className="h-6 w-6 sm:h-8 sm:w-8" />;
      default: return <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" />;
    }
  };

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20',
          border: 'border-red-100 dark:border-red-500/20',
          text: 'text-red-700 dark:text-red-400',
          icon: 'text-red-200 dark:text-red-500/30'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20',
          border: 'border-amber-100 dark:border-amber-500/20',
          text: 'text-amber-700 dark:text-amber-400',
          icon: 'text-amber-200 dark:text-amber-500/30'
        };
      default:
        return {
          bg: 'bg-primary/10 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20',
          border: 'border-primary/30 dark:border-primary/30/20',
          text: 'text-primary dark:text-primary',
          icon: 'text-blue-200 dark:text-primary/30'
        };
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        Critical Action Center
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {alerts.length === 0 ? (
          <div className="col-span-full flex items-center justify-center text-slate-400 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            No critical actions required at this time.
          </div>
        ) : (
          alerts.map((alert: any) => {
            const styles = getAlertStyles(alert.severity);
            const countMatch = alert.message.match(/^(\d+)/);
            const count = countMatch ? countMatch[1] : '!';
            const title = alert.type.replace(/_/g, ' ');

            return (
              <div 
                key={alert.id} 
                className={`${styles.bg} ${styles.border} border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors`}
              >
                <div className="flex-1 pr-2">
                  <div className={`font-black text-xl sm:text-2xl ${styles.text}`}>{count}</div>
                  <div className={`text-xs sm:text-sm font-semibold truncate ${styles.text} opacity-90 capitalize`}>
                    {title.toLowerCase()}
                  </div>
                  <div className={`text-[10px] sm:text-xs mt-1 line-clamp-2 ${styles.text} opacity-75`}>
                    {alert.message}
                  </div>
                </div>
                <div className={styles.icon}>
                  {getAlertIcon(alert.type, alert.severity)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
