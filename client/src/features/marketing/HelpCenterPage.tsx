import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';
import { Search, MessageCircle, Ticket, Phone, Mail, ChevronDown, BookOpen } from 'lucide-react';

const faqs = [
  {
    q: "How do I add a new teacher to the platform?",
    a: "Navigate to the Administration dashboard, click on 'Staff Management', and select 'Add New Staff'. You can assign roles and send them an invitation email directly."
  },
  {
    q: "Can parents have multiple accounts for different children?",
    a: "Yes, the Parent Portal automatically links all siblings enrolled in the school to a single parent account using their verified email address."
  },
  {
    q: "What do I do if I forgot my Administrator password?",
    a: "Click on 'Forgot Password' on the login screen. You will receive a reset link. If you have 2FA enabled, you will also need your recovery codes."
  },
  {
    q: "How often is the system backed up?",
    a: "Our enterprise infrastructure performs real-time database replication and takes full encrypted backups every 12 hours, stored across multiple geographic regions."
  }
];

export const HelpCenterPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-indigo-600 text-white pt-24 pb-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">How can we help?</h1>
            
            <div className="relative max-w-2xl mx-auto mt-10 shadow-2xl">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search for articles, guides, or FAQs..."
                className="block w-full pl-14 pr-4 py-5 rounded-2xl border-none bg-white text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-300 outline-none text-lg transition-all"
              />
            </div>
          </div>
        </section>

        {/* Support Channels Grid */}
        <section className="px-6 -mt-16 relative z-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Knowledge Base</h3>
              <p className="text-slate-500 mb-6 flex-grow">Browse our comprehensive guides and tutorials for self-serve help.</p>
              <a href="/documentation" className="text-indigo-600 font-bold hover:text-indigo-700">Browse Articles &rarr;</a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Submit a Ticket</h3>
              <p className="text-slate-500 mb-6 flex-grow">Can't find the answer? Open a support ticket and we'll investigate.</p>
              <button className="text-emerald-600 font-bold hover:text-emerald-700">Open Ticket &rarr;</button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center text-violet-600 mb-6">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-slate-500 mb-6 flex-grow">Chat with our customer success team in real-time for quick answers.</p>
              <button className="text-violet-600 font-bold hover:text-violet-700">Start Chat &rarr;</button>
            </motion.div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Quick answers to the most common queries from administrators.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-900">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-20 bg-slate-900 text-white text-center px-6">
          <h2 className="text-3xl font-bold mb-10">Need direct assistance?</h2>
          <div className="flex flex-col md:flex-row justify-center gap-12">
            <div className="flex items-center justify-center gap-3">
              <Phone className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-medium">+1 (800) 123-4567</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Mail className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-medium">support@eduxeno.com</span>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;
