import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User as UserIcon, BookOpen, Hash, Phone, HelpCircle, History, Command, Navigation, Zap, FileText, Calendar, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useDebounce } from '../../hooks/useDebounce';
import { StudentPreviewCard } from './StudentPreviewCard';

interface SearchResult {
  id: string;
  type: 'student' | 'navigation' | 'action';
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
  { id: 'act-new-student', type: 'action', title: 'Add New Student', subtitle: 'Register a new admission', icon: Zap, data: 'open-new-student' },
];

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>(STATIC_RESULTS);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
      setResults(STATIC_RESULTS);
    }
  }, [isOpen]);

  // Fetch student results and merge with static filtering
  useEffect(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (q.length < 2) {
      setResults(STATIC_RESULTS);
      return;
    }
    
    setLoading(true);
    
    // Filter static
    const staticMatches = STATIC_RESULTS.filter(r => r.title.toLowerCase().includes(q) || r.subtitle?.toLowerCase().includes(q));

    // Fetch dynamic (Students)
    api.get(`/students/search?q=${encodeURIComponent(q)}`)
      .then(res => {
        const studentMatches: SearchResult[] = res.data.data.map((s: any) => ({
          id: `stu-${s.id}`,
          type: 'student',
          title: s.name,
          subtitle: `${s.classInfo} • ${s.admissionNumber}`,
          avatarUrl: s.avatarUrl,
          data: s.id
        }));
        
        setResults([...staticMatches, ...studentMatches]);
        setSelectedIndex(0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    if (item.type === 'navigation') {
      navigate(item.data);
    } else if (item.type === 'action') {
      window.dispatchEvent(new CustomEvent(item.data));
    } else if (item.type === 'student') {
      navigate(`/dashboard/students/${item.data}`);
    }
  };

  // Arrow navigation
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter' && results.length > 0 && selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, selectedIndex, navigate]);

  if (!isOpen) return null;

  const selectedItem = results[selectedIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row h-[70vh] md:h-[600px]">
        
        <div className="flex-1 flex flex-col border-r border-slate-100 dark:border-slate-800 relative">
          <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800 relative">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              placeholder="Search students, navigate, or run actions..."
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-lg px-4 text-slate-900 dark:text-white placeholder-slate-400"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="search-results"
            />
            {loading && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin absolute right-12" />}
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div id="search-results" className="flex-1 overflow-y-auto p-2" role="listbox">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon || UserIcon;
                  return (
                    <button 
                      key={item.id}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors outline-none ${
                        isSelected ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
                      }`}
                    >
                      {item.type === 'student' ? (
                        item.avatarUrl ? (
                          <img src={item.avatarUrl} alt={item.title} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                            {item.title.charAt(0)}
                          </div>
                        )
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          item.type === 'action' ? 'bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-sm truncate ${isSelected ? 'text-primary dark:text-primary' : 'text-slate-900 dark:text-white'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex-shrink-0">
                            {item.type}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Command className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-base font-medium text-slate-600 dark:text-slate-300">No results found</p>
                <p className="text-sm mt-1">Try searching for a student, "fees", or "attendance"</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-100 dark:border-slate-800 flex justify-center md:justify-between text-xs text-slate-500">
            <div className="hidden md:flex gap-4">
              <span className="flex items-center"><kbd className="bg-white dark:bg-slate-700 border dark:border-slate-600 px-1.5 py-0.5 rounded shadow-sm mr-1.5 font-sans">↑↓</kbd> navigate</span>
              <span className="flex items-center"><kbd className="bg-white dark:bg-slate-700 border dark:border-slate-600 px-1.5 py-0.5 rounded shadow-sm mr-1.5 font-sans">↵</kbd> select</span>
              <span className="flex items-center"><kbd className="bg-white dark:bg-slate-700 border dark:border-slate-600 px-1.5 py-0.5 rounded shadow-sm mr-1.5 font-sans">esc</kbd> close</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-80 bg-slate-50 dark:bg-slate-800/30 overflow-y-auto p-4 border-l border-slate-100 dark:border-slate-800">
          {selectedItem?.type === 'student' ? (
            <StudentPreviewCard studentId={selectedItem.data} />
          ) : selectedItem?.type === 'navigation' ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Navigation className="w-12 h-12 mb-4 text-blue-500/50" />
              <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Navigation</h4>
              <p className="text-sm text-center mt-2">Press enter to quickly jump to the {selectedItem.title.replace('Go to ', '')} module.</p>
            </div>
          ) : selectedItem?.type === 'action' ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Zap className="w-12 h-12 mb-4 text-amber-500/50" />
              <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Quick Action</h4>
              <p className="text-sm text-center mt-2">Press enter to trigger this action without leaving your current page.</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Command className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm text-center">Select an item to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

