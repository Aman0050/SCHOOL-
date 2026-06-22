import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import { Activity, Bell, DollarSign, UserCheck } from 'lucide-react';

export const RecentActivity: React.FC<any> = () => {
  const { socket } = useSocket();
  const [activities, setActivities] = useState<any[]>([
    { id: 1, type: 'ATTENDANCE', text: 'Grade 10 Attendance Submitted by Sarah M.', time: 'Just now' },
    { id: 2, type: 'FEE', text: 'Fee Collection: ?15,000 received from John Doe', time: '5 mins ago' },
    { id: 3, type: 'ALERT', text: 'System Warning: Low attendance threshold in Grade 9', time: '1 hour ago' },
  ]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('activity_feed', (newActivity) => {
      setActivities((prev) => [newActivity, ...prev].slice(0, 10)); // Keep last 10
    });

    return () => {
      socket.off('activity_feed');
    };
  }, [socket]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'ATTENDANCE': return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case 'FEE': return <DollarSign className="h-4 w-4 text-indigo-500" />;
      case 'ALERT': return <Bell className="h-4 w-4 text-amber-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          Live Activity Feed
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {activities.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className="mt-0.5 bg-slate-50 dark:bg-slate-900 p-2 rounded-full border border-slate-100 dark:border-slate-700">
              {getIcon(item.type)}
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
