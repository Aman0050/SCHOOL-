import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';
import { Shield, Server, Users, Activity, Lock, Globe, CheckCircle2, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-6 h-6 text-indigo-600" />,
    title: 'Enterprise-Grade Security',
    description: 'SOC2 compliant infrastructure with end-to-end encryption, regular penetration testing, and automated threat detection.'
  },
  {
    icon: <Server className="w-6 h-6 text-indigo-600" />,
    title: 'High Availability Infrastructure',
    description: '99.99% guaranteed uptime SLA backed by multi-region redundancy and continuous automated backups.'
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-600" />,
    title: 'Multi-Tenant Architecture',
    description: 'Manage thousands of schools from a single pane of glass with granular Role-Based Access Control (RBAC).'
  },
  {
    icon: <Activity className="w-6 h-6 text-indigo-600" />,
    title: 'Advanced Analytics',
    description: 'Real-time BI dashboards, custom report builders, and predictive analytics for student performance and retention.'
  },
  {
    icon: <Lock className="w-6 h-6 text-indigo-600" />,
    title: 'Single Sign-On (SSO)',
    description: 'Seamless integration with Okta, Azure AD, Google Workspace, and any SAML 2.0 identity provider.'
  },
  {
    icon: <Globe className="w-6 h-6 text-indigo-600" />,
    title: 'Custom White-Labeling',
    description: 'Fully customize the platform with your domains, branding, colors, and custom mobile applications.'
  }
];

export const EnterprisePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-6 pb-20 max-w-7xl mx-auto text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-indigo-100 to-purple-50 blur-[100px] opacity-60 rounded-full pointer-events-none -z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-700 mb-6">
              EduXeno Enterprise
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
              Scale Your Educational <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Empire With Confidence</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-3xl mx-auto leading-relaxed">
              The foundational operating system built for massive scale. Secure, compliant, and infinitely customizable for the world's largest school districts and educational networks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact" className="px-8 py-4 text-lg font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
                Contact Sales
              </a>
              <a href="#docs" className="px-8 py-4 text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5">
                View Documentation
              </a>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Engineered for the Enterprise</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">Everything you need to securely manage and scale operations across hundreds of campuses and thousands of students.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-indigo-600/30 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-3xl rounded-full mix-blend-overlay"></div>
              
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">Ready to transform your institution?</h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                Join the visionary educational networks running on EduXeno. Get a personalized demo and architecture review from our enterprise team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <a href="#contact" className="px-8 py-4 text-base font-bold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                  Talk to an Expert <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EnterprisePage;
