import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../../contexts/SocketContext';
import { Clock } from 'lucide-react';

export const RecentTransactionsFeed: React.FC<any> = () => {
  const { socket } = useSocket();
  const [transactions, setTransactions] = useState<any[]>([
    { type: 'FEE', text: 'Fee Collection: ₹12000 received from John Doe', time: 'Just now' },
    { type: 'FEE', text: 'Fee Collection: ₹8500 received from Emma Wilson', time: '5 mins ago' }
  ]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('activity_feed', (newActivity) => {
      if (newActivity.type === 'FEE') {
        setTransactions((prev) => [newActivity, ...prev].slice(0, 15));
      }
    });

    return () => {
      socket.off('activity_feed');
    };
  }, [socket]);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          Live Transactions
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {transactions.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0">
            <div className="mt-0.5 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-full border border-emerald-100 dark:border-emerald-800">
              <Clock className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.text}</p>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
