import React, { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, CheckCircle2, AlertCircle, Info, Clock, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock notifications for demonstration
const initialNotifications = [
  { id: '1', type: 'success', title: 'Fee Payment Received', description: 'John Doe paid ₹15,000 for Term 1', time: '10 min ago', read: false, action: 'View Receipt' },
  { id: '2', type: 'alert', title: 'Low Attendance Alert', description: 'Class 10-A has dropped to 65% attendance today.', time: '1 hour ago', read: false, action: 'Contact Parents' },
  { id: '3', type: 'info', title: 'New Admission', description: 'Sarah Smith application requires administrative review.', time: '2 hours ago', read: true },
  { id: '4', type: 'system', title: 'System Update', description: 'EduXeno updated to v2.4.0 with Enterprise UI.', time: '1 day ago', read: true },
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time incoming notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'alert',
        title: 'Server Load Warning',
        description: 'Database query times have increased slightly during peak hours.',
        time: 'Just now',
        read: false,
        action: 'View Diagnostics'
      }, ...prev]);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>;
      case 'alert': return <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl"><AlertCircle className="w-5 h-5" /></div>;
      case 'system': return <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><ShieldAlert className="w-5 h-5" /></div>;
      case 'info':
      default: return <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Info className="w-5 h-5" /></div>;
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="relative p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full group shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg border-2 border-white dark:border-slate-900"
              >
                {unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenu.Trigger>
      
      <AnimatePresence>
        {isOpen && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content
              asChild
              align="end"
              sideOffset={12}
              className="z-[60]"
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-80 sm:w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-0 overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm border border-indigo-500/20">{unreadCount} new</span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You're all caught up!</p>
                      <p className="text-xs mt-1 text-slate-400">No new notifications at the moment.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      <AnimatePresence initial={false}>
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-5 flex gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                          >
                            {!notification.read && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                            )}
                            <div className="flex-shrink-0">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className={`text-sm font-bold truncate pr-4 ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold shrink-0 mt-0.5">
                                  {notification.time}
                                </p>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                                {notification.description}
                              </p>
                              {notification.action && (
                                <button className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {notification.action} <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <button className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    View Activity Feed
                  </button>
                </div>
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
};
