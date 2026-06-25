import React, { useState } from 'react';
import { useSupport } from '../hooks/useSupport';
import { Search, Book, FileText, Loader2, ChevronRight } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { useKnowledgeBase } = useSupport();
  const { data: articles, isLoading } = useKnowledgeBase(searchQuery);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">How can we help you today?</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, or FAQs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 rounded-2xl py-4 pl-12 pr-4 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all text-lg"
            />
          </div>
          <p className="text-indigo-200">Popular: Admissions, Fee Collection, Teacher Onboarding</p>
        </div>
        <Book className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Categories</h3>
          {['Getting Started', 'Account & Billing', 'Student Management', 'Exams & Results', 'Communication', 'Troubleshooting'].map(category => (
            <div key={category} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-colors group shadow-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{category}</span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Recommended Articles'}
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
          ) : articles && articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article: any) => (
                <div key={article.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl h-fit">
                      <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{article.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{article.content}</p>
                      <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">{article.category}</span>
                        <span>{article.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
