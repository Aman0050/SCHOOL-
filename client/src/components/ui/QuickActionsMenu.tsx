import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Plus, UserPlus, FileText, IndianRupee, BookOpen, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const QuickActionsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string, eventName?: string) => {
    setIsOpen(false);
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName));
    }
    if (path) {
      navigate(path);
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="hidden md:flex items-center justify-center w-9 h-9 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
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
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-2 overflow-hidden"
              >
                <div className="px-3 py-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Quick Actions
                </div>
                
                <div className="space-y-1">
                  <DropdownMenu.Item asChild>
                    <button 
                      onClick={() => handleAction('/dashboard/students', 'open-new-student')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group outline-none cursor-pointer"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Add Student</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Register new admission</p>
                      </div>
                    </button>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <button 
                      onClick={() => handleAction('/dashboard/attendance')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group outline-none cursor-pointer"
                    >
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Mark Attendance</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Daily roll call</p>
                      </div>
                    </button>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <button 
                      onClick={() => handleAction('/dashboard/fees')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group outline-none cursor-pointer"
                    >
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Collect Fee</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Record new payment</p>
                      </div>
                    </button>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <button 
                      onClick={() => handleAction('/dashboard/examinations')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group outline-none cursor-pointer"
                    >
                      <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Publish Results</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Upload exam marks</p>
                      </div>
                    </button>
                  </DropdownMenu.Item>
                </div>
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
};
