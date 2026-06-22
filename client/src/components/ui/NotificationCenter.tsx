import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, CheckCircle2, AlertCircle, Info, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock notifications for demonstration
const initialNotifications = [
  { id: '1', type: 'success', title: 'Fee Payment Received', description: 'John Doe paid $500 for Term 1', time: '10 min ago', read: false },
  { id: '2', type: 'alert', title: 'Low Attendance Alert', description: 'Class 10-A has 65% attendance today', time: '1 hour ago', read: false },
  { id: '3', type: 'info', title: 'New Admission', description: 'Sarah Smith application requires review', time: '2 hours ago', read: true },
  { id: '4', type: 'info', title: 'System Update', description: 'EduXeno updated to v2.4.0', time: '1 day ago', read: true },
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full group">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-[#0A1128]"
              >
                {unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-0 overflow-hidden animate-in fade-in slide-in-from-top-2"
          align="end"
          sideOffset={12}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{unreadCount} new</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button className="w-full py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
              View All Activity
            </button>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
