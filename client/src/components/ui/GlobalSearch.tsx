import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User as UserIcon, BookOpen, Hash, Phone, HelpCircle, History, Command, Navigation, Zap, FileText, Calendar, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useDebounce } from '../../hooks/useDebounce';
import { StudentPreviewCard } from './StudentPreviewCard';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  type: 'student' | 'navigation' | 'action' | 'fee' | 'exam' | 'teacher';
  title: string;
  subtitle?: string;
  icon?: any;
  avatarUrl?: string | null;
  data?: any;
}

const STATIC_RESULTS: SearchResult[] = [
  // Navigation
  { id: 'nav-students', type: 'navigation', title: 'Go to Students', subtitle: 'View directory', icon: UserIcon, data: '/dashboard/students' },
  { id: 'nav-attendance', type: 'navigation', title: 'Go to Attendance', subtitle: 'Mark and view attendance', icon: Calendar, data: '/dashboard/attendance' },
  { id: 'nav-fees', type: 'navigation', title: 'Go to Fees', subtitle: 'Manage payments', icon: IndianRupee, data: '/dashboard/fees' },
  { id: 'nav-exams', type: 'navigation', title: 'Go to Examinations', subtitle: 'Exam schedules and marks', icon: FileText, data: '/dashboard/examinations' },
  { id: 'nav-academics', type: 'navigation', title: 'Go to Academics', subtitle: 'Timetables and curriculum', icon: BookOpen, data: '/dashboard/academics' },
  // Actions
  { id: 'act-new-student', type: 'navigation', title: 'Add New Student', subtitle: 'Register a new admission', icon: Zap, data: '/dashboard/students?tab=admissions&action=new' },
];

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>(STATIC_RESULTS);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRecentSearch = (item: SearchResult) => {
    // Only save dynamic items
    if (item.type === 'navigation' || item.type === 'action') return;
    const newRecents = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5);
    setRecentSearches(newRecents);
    localStorage.setItem('recentSearches', JSON.stringify(newRecents));
  };

  // Listen for Cmd+K / Ctrl+K and open-search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    const handleOpenSearch = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-search', handleOpenSearch);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-search', handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
      setResults(recentSearches.length > 0 ? recentSearches : STATIC_RESULTS);
    }
  }, [isOpen, recentSearches]);

  // Fetch search results and merge with static filtering
  useEffect(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (q.length < 2) {
      setResults(recentSearches.length > 0 && q.length === 0 ? recentSearches : STATIC_RESULTS);
      return;
    }
    
    setLoading(true);
    
    // Filter static
    const staticMatches = STATIC_RESULTS.filter(r => r.title.toLowerCase().includes(q) || r.subtitle?.toLowerCase().includes(q));

    // Fetch dynamic unified search
    api.get(`/search?q=${encodeURIComponent(q)}`)
      .then(res => {
        const dynamicMatches = res.data.data;
        setResults([...staticMatches, ...dynamicMatches]);
        setSelectedIndex(0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    saveRecentSearch(item);
    if (item.type === 'navigation') {
      navigate(item.data);
    } else if (item.type === 'action') {
      window.dispatchEvent(new CustomEvent(item.data));
    } else if (item.type === 'student') {
      navigate(`/dashboard/students/${item.data}`);
    } else if (item.type === 'fee') {
      navigate(`/dashboard/fees`);
    } else if (item.type === 'exam') {
      navigate(`/dashboard/examinations`);
    } else if (item.type === 'teacher') {
      navigate(`/dashboard/staff`);
    }
  };

  // Arrow navigation
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        document.getElementById(`search-result-${selectedIndex + 1}`)?.scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        document.getElementById(`search-result-${selectedIndex - 1}`)?.scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter' && results.length > 0 && selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, selectedIndex, navigate]);

  const selectedItem = results[selectedIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]" role="dialog" aria-modal="true">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row h-[70vh] md:h-[600px] relative z-10"
          >
            <div className="flex-1 flex flex-col border-r border-slate-100 dark:border-slate-800 relative">
              <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800 relative bg-white/50 dark:bg-slate-900/50">
                <Search className="w-6 h-6 text-primary shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  placeholder="Search students, navigate, or run actions..."
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-xl px-4 text-slate-900 dark:text-white placeholder-slate-400 font-medium"
                  role="combobox"
                  aria-expanded={isOpen}
                  aria-controls="search-results"
                />
                {loading && <Loader2 className="w-5 h-5 text-primary animate-spin absolute right-14" />}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div id="search-results" className="flex-1 overflow-y-auto p-2 custom-scrollbar" role="listbox">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {query.length === 0 && recentSearches.length > 0 && (
                      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <History className="w-3 h-3" /> Recent Searches
                      </div>
                    )}
                    {results.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      let Icon = item.icon || UserIcon;
                      if (item.type === 'fee') Icon = IndianRupee;
                      if (item.type === 'exam') Icon = FileText;
                      
                      return (
                        <motion.button 
                          id={`search-result-${idx}`}
                          key={item.id}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => handleSelect(item)}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all outline-none border border-transparent ${
                            isSelected ? 'bg-primary/10 border-primary/30/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          {item.type === 'student' || item.type === 'teacher' ? (
                            item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={item.title} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${isSelected ? 'bg-primary/20 text-primary border-primary/30/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
                                {item.title.charAt(0)}
                              </div>
                            )
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                              item.type === 'action' 
                                ? isSelected ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' : 'bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400' 
                                : item.type === 'fee'
                                ? isSelected ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400'
                                : isSelected ? 'bg-primary/20 border-primary/30/30 text-primary' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold text-sm truncate transition-colors ${isSelected ? 'text-primary dark:text-primary' : 'text-slate-900 dark:text-white'}`}>
                                {item.title}
                              </p>
                              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex-shrink-0 transition-colors ${
                                isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {item.type}
                              </span>
                            </div>
                            {item.subtitle && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                    <Command className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                    <p className="text-base font-bold text-slate-600 dark:text-slate-300">No results found</p>
                    <p className="text-sm mt-1 font-medium text-slate-500">Try searching for a student, "fees", or "attendance"</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 border-t border-slate-100 dark:border-slate-800 flex justify-center md:justify-between text-xs text-slate-500">
                <div className="hidden md:flex gap-4">
                  <span className="flex items-center"><kbd className="bg-white dark:bg-slate-700 border dark:border-slate-600 px-2 py-0.5 rounded shadow-sm mr-2 font-sans font-medium text-slate-700 dark:text-slate-300">↑↓</kbd> navigate</span>
                  <span className="flex items-center"><kbd className="bg-white dark:bg-slate-700 border dark:border-slate-600 px-2 py-0.5 rounded shadow-sm mr-2 font-sans font-medium text-slate-700 dark:text-slate-300">↵</kbd> select</span>
                  <span className="flex items-center"><kbd className="bg-white dark:bg-slate-700 border dark:border-slate-600 px-2 py-0.5 rounded shadow-sm mr-2 font-sans font-medium text-slate-700 dark:text-slate-300">esc</kbd> close</span>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-80 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm overflow-y-auto p-4 border-l border-slate-100 dark:border-slate-800">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedItem?.id || 'empty'}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  {selectedItem?.type === 'student' ? (
                    <StudentPreviewCard studentId={selectedItem.data} />
                  ) : selectedItem?.type === 'navigation' ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Navigation className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Navigation</h4>
                      <p className="text-sm text-center mt-2 font-medium px-4">Press enter to quickly jump to the {selectedItem.title.replace('Go to ', '')} module.</p>
                    </div>
                  ) : selectedItem?.type === 'action' ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                        <Zap className="w-8 h-8 text-amber-500" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Quick Action</h4>
                      <p className="text-sm text-center mt-2 font-medium px-4">Press enter to trigger this action without leaving your current page.</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <Command className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm text-center font-medium">Select an item to view details</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

