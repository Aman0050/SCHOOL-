import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    institutionName: '',
    email: '',
    phoneNumber: '',
    studentsCount: '0 - 500',
    campusesCount: '1',
    contactVia: 'Phone',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Backend Database
      await api.post('/marketing/demo-requests', formData);

      // 2. Construct WhatsApp Message
      const text = `Hi, I would like to book a demo for EduXeno!
      
*Name:* ${formData.fullName}
*Institution:* ${formData.institutionName}
*Email:* ${formData.email}
*Phone:* ${formData.phoneNumber}
*Students:* ${formData.studentsCount}
*Campuses:* ${formData.campusesCount}
*Preferred Contact:* ${formData.contactVia}
${formData.message ? `*Additional Message:* ${formData.message}` : ''}`;

      const whatsappUrl = `https://wa.me/919310786512?text=${encodeURIComponent(text)}`;

      toast.success('Inquiry submitted! Redirecting to WhatsApp...', { duration: 4000 });
      
      // Reset form & close
      setFormData({
        fullName: '',
        institutionName: '',
        email: '',
        phoneNumber: '',
        studentsCount: '0 - 500',
        campusesCount: '1',
        contactVia: 'Phone',
        message: ''
      });
      onClose();

      // 3. Open WhatsApp in new tab
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row pointer-events-auto max-h-[90vh] overflow-y-auto"
            >
              
              {/* Left Panel - Instant Connect */}
              <div className="w-full md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 opacity-50" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-100 rounded-full blur-[80px] -z-10 opacity-50" />
                
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Instant Connect</h3>
                <p className="text-slate-500 mb-10 text-sm leading-relaxed font-medium">
                  Skip the queue. Chat directly with the platform architects on WhatsApp.
                </p>

                <div className="space-y-4 flex-grow">
                  <a href="https://wa.me/919310786512" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Sufyan Khan</h4>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Founder</span>
                        <span className="text-xs text-slate-500 font-medium">+91 93107 86512</span>
                      </div>
                    </div>
                  </a>

                  <a href="https://wa.me/917827392589" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Aman Naeem</h4>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Co-Founder</span>
                        <span className="text-xs text-slate-500 font-medium">+91 78273 92589</span>
                      </div>
                    </div>
                  </a>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-200/60">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enterprise Grade SLA</span>
                </div>
              </div>

              {/* Right Panel - Form */}
              <div className="w-full md:w-2/3 p-8 md:p-10 relative">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Book Live Demonstration</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Institution Name</label>
                      <input 
                        type="text" 
                        name="institutionName"
                        value={formData.institutionName}
                        onChange={handleChange}
                        required
                        placeholder="Greenwood High"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="admin@school.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Students</label>
                      <select 
                        name="studentsCount"
                        value={formData.studentsCount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium appearance-none"
                      >
                        <option>0 - 500</option>
                        <option>501 - 2000</option>
                        <option>2000+</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Campuses</label>
                      <select 
                        name="campusesCount"
                        value={formData.campusesCount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium appearance-none"
                      >
                        <option>1</option>
                        <option>2 - 5</option>
                        <option>5+</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Via</label>
                      <select 
                        name="contactVia"
                        value={formData.contactVia}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium appearance-none"
                      >
                        <option>Phone</option>
                        <option>Email</option>
                        <option>WhatsApp</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Additional Message (Optional)</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any specific requirements or pain points?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary transition-colors shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group mt-4 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Submit Inquiry <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                    )}
                  </button>
                </form>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
