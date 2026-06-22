import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { Zap, Shield, Users, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';
import { BookDemoModal } from './BookDemoModal';

const FEATURES = [
  { icon: Users, title: 'Multi-Portal Ecosystem', desc: 'Dedicated, beautiful portals for Super Admins, Teachers, Parents, and Students.' },
  { icon: Zap, title: 'Real-Time Infrastructure', desc: 'WebSockets power instant attendance updates and real-time messaging.' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Predictive intelligence and beautiful charts to monitor school health.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption, MFA, and granular Role-Based Access Control.' },
];

export const LandingPage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-500/30 font-sans text-slate-900 overflow-hidden">
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Animated Background Gradients (Light version) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-40 pointer-events-none -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900"
          >
            The Operating System for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Modern Schools
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Replace your clunky legacy software. Unify administration, fees, attendance, and parent communication in one incredibly fast, beautifully designed platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => setDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20"
            >
              Book a Demo 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-full font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Sign In to Portal
            </Link>
          </motion.div>
        </div>


      </section>

      {/* LOGO CLOUD */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Trusted by innovative schools worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
            {/* Mock Logos */}
            {['Acme Academy', 'Global High', 'Starlight Prep', 'Pinnacle Edu'].map((name, i) => (
              <div key={i} className="text-xl font-bold font-serif">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section id="features" className="py-32 px-6 bg-white relative">

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">Everything you need to run a modern institution.</h2>
            <p className="text-lg text-slate-600 font-medium">We stripped away the complexity of legacy ERPs and rebuilt school management from the ground up with modern technologies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 shadow-sm shadow-slate-200/50 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 text-indigo-600 shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{feat.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm font-medium">{feat.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="py-32 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">Solutions for Every Role.</h2>
            <p className="text-lg text-slate-600 font-medium">Tailored portals providing exactly what you need, right when you need it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3"><span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">🏢</span> Administration</h3>
              <p className="text-slate-600 leading-relaxed">Gain a bird's-eye view of school operations. Manage admissions, handle fees and invoicing automatically, and oversee staff attendance from a powerful, unified command center.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3"><span className="p-2 bg-purple-50 text-purple-600 rounded-lg">👨‍🏫</span> Teachers</h3>
              <p className="text-slate-600 leading-relaxed">Spend less time on paperwork. Effortlessly grade assignments, take attendance in two clicks, and communicate directly with parents without leaving the platform.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3"><span className="p-2 bg-blue-50 text-blue-600 rounded-lg">👪</span> Parents</h3>
              <p className="text-slate-600 leading-relaxed">Stay deeply involved in your child's education. Receive instant notifications for grades and attendance, pay fees securely, and message teachers directly.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3"><span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">🎓</span> Students</h3>
              <p className="text-slate-600 leading-relaxed">Take charge of your learning. Access schedules, submit assignments online, track academic progress, and collaborate with peers in a distraction-free hub.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-32 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-lg text-slate-600 font-medium">No hidden fees. No complex contracts. Start immediately.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-2 text-slate-900">Starter</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">For small schools just getting started.</p>
              <div className="text-4xl font-extrabold mb-8 text-slate-900">$199<span className="text-lg text-slate-500 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['Up to 500 Students', 'Basic Analytics', 'Teacher Portal', 'Email Support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className="block w-full py-3.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-center rounded-xl font-bold transition-colors">Start Trial</Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-indigo-600 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-indigo-600/30">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-indigo-300 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>
              <h3 className="text-xl font-bold mb-2 text-white">Professional</h3>
              <p className="text-indigo-200 text-sm mb-6 font-medium">For growing institutions needing more power.</p>
              <div className="text-4xl font-extrabold mb-8 text-white">$499<span className="text-lg text-indigo-300 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['Up to 2,000 Students', 'Advanced Analytics', 'Parent & Student Portals', 'Priority 24/7 Support', 'Custom Domain'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className="block w-full py-3.5 px-4 bg-white text-indigo-600 hover:bg-indigo-50 text-center rounded-xl font-bold transition-colors shadow-lg">Start Trial</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-2 text-slate-900">Enterprise</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">For large districts and university campuses.</p>
              <div className="text-4xl font-extrabold mb-8 text-slate-900">Custom</div>
              <ul className="space-y-4 mb-8">
                {['Unlimited Students', 'Multiple Campuses', 'Dedicated Success Manager', 'SSO & Advanced Security', 'Custom Integrations'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {f}
                  </li>
                ))}
              </ul>
              <button className="block w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-xl font-bold transition-colors shadow-md">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
