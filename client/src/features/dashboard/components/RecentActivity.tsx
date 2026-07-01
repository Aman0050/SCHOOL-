import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import { Activity, Bell, DollarSign, UserCheck, BookOpen, GraduationCap, UserPlus, CreditCard, Clock } from 'lucide-react';
import api from '../../../lib/api';

import { useQuery } from '@tanstack/react-query';

export const RecentActivity: React.FC = () => {
  const { socket } = useSocket();

  const { data: initialActivities, isLoading: isQueryLoading } = useQuery({
    queryKey: ['dashboard', 'activityFeed'],
    queryFn: () => api.get('/dashboard/activity-feed').then(res => res.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
      setLoading(false);
    } else if (!isQueryLoading) {
      setLoading(false);
    }
  }, [initialActivities, isQueryLoading]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for global audit logs (activity_feed) or broadcast events
    const handleActivity = (newActivity: any) => {
      setActivities((prev) => {
        // Prepend and ensure no duplicates
        if (prev.find(a => a.id === newActivity.id)) return prev;
        return [newActivity, ...prev].slice(0, 50); // Keep last 50
      });
    };

    socket.on('activity_feed', handleActivity);
    socket.on('audit_event', handleActivity);

    return () => {
      socket.off('activity_feed', handleActivity);
      socket.off('audit_event', handleActivity);
    };
  }, [socket]);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'UserCheck': return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case 'CreditCard': return <CreditCard className="h-4 w-4 text-primary" />;
      case 'DollarSign': return <DollarSign className="h-4 w-4 text-primary" />;
      case 'Bell': return <Bell className="h-4 w-4 text-amber-500" />;
      case 'UserPlus': return <UserPlus className="h-4 w-4 text-emerald-400" />;
      case 'Clock': return <Clock className="h-4 w-4 text-primary" />;
      case 'GraduationCap': return <GraduationCap className="h-4 w-4 text-rose-500" />;
      case 'BookOpen': return <BookOpen className="h-4 w-4 text-primary" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden relative">
      <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-4 z-10">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            Live Activity Feed
          </h3>
          <p className="text-xs text-slate-500 mt-1">Real-time system events</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar z-10">
        {loading ? (
          <div className="animate-pulse space-y-4">
             <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
             <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
             <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">No recent activity</div>
        ) : (
          activities.map((item, idx) => (
            <div key={item.id || idx} className="flex gap-3 items-start group">
              <div className="mt-0.5 bg-slate-50 dark:bg-slate-900 p-2 rounded-full border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                {getIcon(item.icon)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.user}</span> {item.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">{formatTime(item.time)}</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{item.action}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
