import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock notifications for demonstration
const initialNotifications = [
  { id: '1', type: 'alert', title: 'FEE PAYMENT RECEIVED', description: 'John Doe paid ₹15,000 for Term 1 tuition fees.', time: '10 min ago', read: false },
  { id: '2', type: 'alert', title: 'LOW ATTENDANCE ALERT', description: 'Class 10-A has dropped to 65% attendance today.', time: '1 hour ago', read: false },
  { id: '3', type: 'success', title: 'NEW ADMISSION', description: 'Sarah Smith application requires administrative review.', time: '2 hours ago', read: true },
  { id: '4', type: 'success', title: 'SYSTEM UPDATE', description: 'EduXeno updated to v2.4.0 with Enterprise UI.', time: '1 day ago', read: true },
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time incoming notification and listen for custom open events
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'alert',
        title: 'SERVER LOAD WARNING',
        description: 'Database query times have increased slightly during peak hours.',
        time: 'Just now',
        read: false
      }, ...prev]);
    }, 15000);

    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-notifications', handleOpen);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-notifications', handleOpen);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors focus:outline-none group">
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
      </Dialog.Trigger>
      
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm" 
              />
            </Dialog.Overlay>
            <Dialog.Content asChild className="fixed z-[110] right-0 top-0 bottom-0 w-full sm:w-[400px] outline-none">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="h-full bg-slate-50 dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-8 border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0B0F19]">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white tracking-widest uppercase">
                      <Bell className="w-5 h-5 text-primary dark:text-primary" fill="currentColor" />
                      NOTIFICATION CENTER
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest mt-1 uppercase">
                      {unreadCount} UNREAD NOTIFICATIONS
                    </p>
                  </div>
                  <Dialog.Close asChild>
                    <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="font-bold tracking-widest uppercase">NO NEW ALERTS</p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => markAsRead(notification.id)}
                          className={`group relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border shadow-sm
                            ${!notification.read ? 'bg-white dark:bg-slate-800 border-primary/30 dark:border-primary/30/30 shadow-md' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'}
                          `}
                        >
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full transition-all duration-300
                            ${!notification.read ? 'h-12 bg-primary' : 'h-0 group-hover:h-8 bg-slate-300 dark:bg-slate-600'}
                          `} />
                          
                          <div className={`flex-shrink-0 p-2.5 rounded-xl transition-colors
                            ${!notification.read ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
                          `}>
                            <Bell className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex justify-between items-start mb-1.5">
                              <p className={`text-sm font-black tracking-widest truncate uppercase ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {notification.title}
                              </p>
                              <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 shrink-0 ml-2 mt-0.5">
                                {notification.time}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed font-medium ${!notification.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                              {notification.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Footer Actions */}
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 flex gap-2 bg-white dark:bg-[#0B0F19]">
                    <button 
                      onClick={markAllAsRead}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-widest text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors uppercase"
                    >
                      <Check className="w-3 h-3" strokeWidth={3} /> Mark Read
                    </button>
                    <button 
                      onClick={clearAll}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors uppercase"
                    >
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
