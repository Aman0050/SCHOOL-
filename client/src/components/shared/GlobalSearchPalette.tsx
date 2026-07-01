import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Users, IndianRupee, Settings, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalSearchPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce logic
  useEffect(() => {
    if (!query) {
      setDebouncedQuery('');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSelect = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />

          {/* Palette */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden relative z-10"
          >
            <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
              <Search className="w-6 h-6 text-primary mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent border-none outline-none text-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Search students, fees, or actions..."
                value={query}
                onChange={handleSearch}
              />
              {isLoading && <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />}
              <div className="ml-3 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono font-bold text-slate-500 border border-slate-200 dark:border-slate-700">ESC</div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {!query && (
                <div className="p-8 text-center text-slate-500 text-sm font-medium">
                  Type <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs mx-1">something</kbd> to search across the platform.
                </div>
              )}
              
              {debouncedQuery && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Students & Staff</div>
                    <motion.button 
                      whileHover={{ scale: 0.99, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect('/dashboard/students')}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 flex items-center gap-4 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Rahul Kumar (Found 1 match)</div>
                        <div className="text-xs text-slate-500 font-medium">Class 10-A • Student • Click to view profile</div>
                      </div>
                    </motion.button>
                  </div>

                  <div>
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Finance & Fees</div>
                    <motion.button 
                      whileHover={{ scale: 0.99, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect('/dashboard/fees')}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 flex items-center gap-4 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Q3 Tuition Fee Invoice</div>
                        <div className="text-xs text-rose-500 font-bold">Unpaid • ₹15,000 • Due in 2 days</div>
                      </div>
                    </motion.button>
                  </div>

                  <div>
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</div>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button 
                        whileHover={{ scale: 0.98 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect('/dashboard/academics')}
                        className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <BookOpen className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View Timetable</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 0.98 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect('/dashboard/settings')}
                        className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Settings</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearchPalette;
