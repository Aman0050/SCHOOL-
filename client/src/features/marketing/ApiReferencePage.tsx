import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';
import { Code2, Key, Webhook, Database, ArrowRight, CheckCircle2, Copy } from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/v1/students',
    desc: 'Retrieve a list of students for the authenticated school.'
  },
  {
    method: 'POST',
    path: '/v1/attendance',
    desc: 'Record daily attendance records in bulk.'
  },
  {
    method: 'GET',
    path: '/v1/teachers/{id}/schedule',
    desc: 'Get the timetable for a specific teacher.'
  }
];

export const ApiReferencePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-24">
        {/* Header */}
        <div className="bg-slate-900 text-white pt-24 pb-20 px-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <span className="text-indigo-400 font-mono text-sm font-bold tracking-wider uppercase mb-4 block">EduXeno Developers</span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">API Reference</h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                Build powerful integrations with our RESTful API. Manage students, automate attendance, and extend EduXeno into your existing ecosystem.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary transition-colors shadow-lg shadow-primary/20">
                Generate API Key
              </button>
              <button className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                View Postman Collection
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column - Docs */}
          <div className="lg:col-span-7 space-y-16">
            
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Key className="w-8 h-8 text-primary" /> Authentication
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                The EduXeno API uses API keys to authenticate requests. You can view and manage your API keys in the Developer Settings of your dashboard.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-amber-800">
                <p className="font-semibold flex items-center gap-2"><ShieldAlertIcon /> Keep your keys secure</p>
                <p className="text-sm mt-2">Your API keys carry many privileges. Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Code2 className="w-8 h-8 text-primary" /> Core Endpoints
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                All API endpoints are authenticated using Bearer tokens. Base URL for all v1 requests is <code>https://api.eduxeno.com</code>.
              </p>

              <div className="space-y-6">
                {endpoints.map((ep, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                        ep.method === 'GET' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono font-medium text-slate-700">{ep.path}</span>
                    </div>
                    <p className="text-slate-500">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column - Code Examples */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              
              <div className="bg-[#0D1117] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#161b22]">
                  <span className="text-slate-400 text-xs font-mono">Authentication Example</span>
                  <button className="text-slate-500 hover:text-slate-300"><Copy className="w-4 h-4" /></button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                    <span className="text-pink-400">curl</span> https://api.eduxeno.com/v1/students \<br/>
                    {'  '}-H <span className="text-emerald-400">"Authorization: Bearer sk_test_12345"</span>
                  </pre>
                </div>
              </div>

              <div className="bg-[#0D1117] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#161b22]">
                  <span className="text-slate-400 text-xs font-mono">Response (200 OK)</span>
                  <button className="text-slate-500 hover:text-slate-300"><Copy className="w-4 h-4" /></button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono text-slate-300 leading-relaxed">
{`{
  "object": "list",
  "data": [
    {
      "id": "stu_01",
      "name": "Sarah Connor",
      "grade": "10th",
      "status": "active"
    }
  ],
  "has_more": false
}`}
                  </pre>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

function ShieldAlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}

export default ApiReferencePage;
