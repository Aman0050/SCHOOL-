import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users, FileText, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GlobalSearchPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsLoading(true);
    // Debounce search in a real app
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Search students, teachers, fees, or settings..."
            value={query}
            onChange={handleSearch}
            autoFocus
          />
          {isLoading && <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />}
          <div className="ml-3 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-500">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {!query && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Type to search across the entire platform.
            </div>
          )}
          
          {query && !isLoading && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</div>
              <button 
                onClick={() => { setIsOpen(false); navigate('/dashboard/students'); }}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">Rahul Kumar</div>
                  <div className="text-xs text-slate-500">Class 10-A • ADM-2026-001</div>
                </div>
              </button>

              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Finance</div>
              <button 
                onClick={() => { setIsOpen(false); navigate('/dashboard/fees'); }}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">Q3 Tuition Fee Invoice</div>
                  <div className="text-xs text-slate-500">Status: Unpaid • Amount: ₹15,000</div>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Invisible backdrop click catcher to close */}
      <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
    </div>
  );
};

export default GlobalSearchPalette;
