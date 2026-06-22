import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title = "Coming Soon" }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 md:p-16 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-indigo-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">{title !== "Coming Soon" ? `${title} is Coming Soon` : "Coming Soon"}</h1>
            <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
              We're currently brewing up something amazing for the {title} page. Our team is working hard to bring you comprehensive details, documentation, and more resources. Check back soon!
            </p>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">
              Return to Homepage
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlaceholderPage;
