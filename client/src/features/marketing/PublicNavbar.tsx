import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { BookDemoModal } from './BookDemoModal';

export const PublicNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            Edu<span className="text-indigo-600 font-serif italic uppercase font-normal ml-0.5">XENO</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          
          <div className="flex items-center gap-4 ml-4">
            <Link to="/login" className="text-slate-700 hover:text-indigo-600 transition-colors">Sign In</Link>
            <button 
              onClick={() => setDemoModalOpen(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Book a Demo
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-slate-900 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </motion.nav>
  );
};
