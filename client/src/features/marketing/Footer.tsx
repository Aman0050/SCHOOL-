import React from 'react';
import { GraduationCap, Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:bg-indigo-700 transition-colors shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Edu<span className="text-indigo-600 font-serif italic uppercase font-normal ml-0.5">XENO</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
              The operating system for modern schools. Unifying administration, communication, and learning in one beautiful platform.
            </p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-indigo-600 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-bold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><a href="/#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
              <li><Link to="/security" className="hover:text-indigo-600 transition-colors">Security</Link></li>
              <li><Link to="/enterprise" className="hover:text-indigo-600 transition-colors">Enterprise</Link></li>
              <li><a href="/#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><Link to="/documentation" className="hover:text-indigo-600 transition-colors">Documentation</Link></li>
              <li><Link to="/help-center" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
              <li><Link to="/api-reference" className="hover:text-indigo-600 transition-colors">API Reference</Link></li>
              <li><Link to="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-indigo-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} EduXeno Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Status: All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
