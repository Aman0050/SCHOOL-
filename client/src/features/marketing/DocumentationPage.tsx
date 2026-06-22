import React, { useEffect, useState } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';
import { Search, Book, Terminal, ShieldAlert, Users, GraduationCap, ChevronRight, FileText } from 'lucide-react';

const categories = [
  {
    icon: <Book className="w-5 h-5" />,
    title: 'Getting Started',
    description: 'Learn the basics of EduXeno and set up your school in minutes.',
    articles: ['Platform Overview', 'Initial Setup Guide', 'Inviting Users']
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Administration',
    description: 'Manage users, roles, permissions, and organizational structures.',
    articles: ['RBAC Deep Dive', 'Managing Terms & Semesters', 'Data Imports']
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: 'Academic Management',
    description: 'Handle attendance, grading, examinations, and report cards.',
    articles: ['Setting up Gradebooks', 'Attendance Tracking', 'Exam Generation']
  },
  {
    icon: <Terminal className="w-5 h-5" />,
    title: 'Integrations',
    description: 'Connect EduXeno with your existing tools and services.',
    articles: ['Google Workspace Sync', 'Canvas LMS Integration', 'Custom Webhooks']
  }
];

export const DocumentationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-24">
        {/* Header with Search */}
        <div className="bg-slate-900 text-white pt-20 pb-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">EduXeno Documentation</h1>
            <p className="text-xl text-slate-300 mb-10">Everything you need to set up, manage, and scale your institution on EduXeno.</p>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search guides, tutorials, and API docs..."
                className="block w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white/10 text-white placeholder-slate-400 backdrop-blur-md focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-xs text-slate-400 border border-slate-600 rounded px-2 py-1">⌘ K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout container */}
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">Quick Links</h3>
              <ul className="space-y-3 text-slate-600 font-medium text-sm">
                <li><a href="#" className="hover:text-indigo-600 flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Release Notes</a></li>
                <li><a href="#" className="hover:text-indigo-600 flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Video Tutorials</a></li>
                <li><a href="#" className="hover:text-indigo-600 flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Developer API</a></li>
                <li><a href="#" className="hover:text-indigo-600 flex items-center gap-2"><ChevronRight className="w-4 h-4" /> System Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">Most Read</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="group block">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Setting up your first term</h4>
                    <p className="text-xs text-slate-500 mt-1">Learn how to configure academic calendars.</p>
                  </a>
                </li>
                <li>
                  <a href="#" className="group block">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Importing students via CSV</h4>
                    <p className="text-xs text-slate-500 mt-1">Step-by-step guide to bulk data imports.</p>
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      {category.icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{category.title}</h2>
                  </div>
                  <p className="text-slate-500 text-sm mb-6">{category.description}</p>
                  
                  <ul className="space-y-3">
                    {category.articles.map((article, i) => (
                      <li key={i}>
                        <a href="#" className="flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors group">
                          <FileText className="w-4 h-4 mr-2 text-slate-400 group-hover:text-indigo-600" />
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="inline-block mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700">View all articles &rarr;</a>
                </motion.div>
              ))}
            </div>

            {/* Need Help Box */}
            <div className="mt-12 bg-slate-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
              <ShieldAlert className="w-10 h-10 mx-auto text-indigo-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h3>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto">Our dedicated enterprise support team is available 24/7 to help you resolve any issues.</p>
              <a href="/help-center" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors">
                Contact Support
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DocumentationPage;
