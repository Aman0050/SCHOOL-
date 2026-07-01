import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../../../contexts/SocketContext';
import { CheckCircle2 } from 'lucide-react';

export const LiveAttendanceFeed: React.FC<any> = () => {
  const { socket } = useSocket();
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('attendance_updated', (newActivity) => {
      setFeed((prev) => [newActivity, ...prev].slice(0, 15));
    });

    return () => {
      socket.off('attendance_updated');
    };
  }, [socket]);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          Live Submission Feed
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {feed.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400 italic">
            Waiting for live submissions...
          </div>
        ) : (
          feed.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0">
              <div className="mt-0.5 bg-primary/10 dark:bg-primary/20 p-2 rounded-full border border-primary/30 dark:border-primary/30">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.text}</p>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
