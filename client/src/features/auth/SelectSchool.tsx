import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import { School, ArrowRight, Sparkles } from 'lucide-react';

export const SelectSchool: React.FC = () => {
  const { setTenant, tenantSubdomain } = useAuth();
  const [inputSubdomain, setInputSubdomain] = useState('');
  const navigate = useNavigate();

  const handleSelect = (subdomain: string) => {
    setTenant(subdomain);
    navigate('/login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSubdomain.trim()) {
      handleSelect(inputSubdomain.trim().toLowerCase());
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 text-slate-100 overflow-hidden">
      {/* Background Graphic Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>

      <div className="relative w-full max-w-md space-y-8 dark-glass p-8 rounded-3xl shadow-2xl border border-slate-800">
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10">
            <School className="h-7 w-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Welcome to EduXeno
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Select Your School
          </h2>
          <p className="text-sm text-slate-400">
            Choose a school to access your localized student and management dashboard.
          </p>
        </div>

        {/* Option A: Seeded High-quality schools */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quick Connect Schools
          </label>
          <div className="grid gap-3">
            <button
              onClick={() => handleSelect('greenwood')}
              className="group flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 hover:bg-emerald-900/20 border border-slate-700/50 hover:border-emerald-500/40 transition-all duration-300 shadow-md text-left"
            >
              <div className="space-y-1">
                <p className="font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  Greenwood High School
                </p>
                <p className="text-xs text-slate-400">Subdomain: greenwood (Theme: Forest Green)</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-700/30 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-300 flex items-center justify-center transition-all">
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => handleSelect('oakridge')}
              className="group flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 hover:bg-amber-900/20 border border-slate-700/50 hover:border-amber-500/40 transition-all duration-300 shadow-md text-left"
            >
              <div className="space-y-1">
                <p className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                  Oakridge Academy
                </p>
                <p className="text-xs text-slate-400">Subdomain: oakridge (Theme: Deep Amber)</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-700/30 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 flex items-center justify-center transition-all">
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Or Enter Custom
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Option B: Enter Custom Subdomain */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subdomain" className="text-xs font-semibold text-slate-400">
              School Subdomain
            </label>
            <div className="relative flex rounded-xl border border-slate-700 bg-slate-850 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden">
              <input
                id="subdomain"
                type="text"
                required
                placeholder="e.g. greenwood"
                value={inputSubdomain}
                onChange={(e) => setInputSubdomain(e.target.value)}
                className="w-full bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none placeholder-slate-500"
              />
              <span className="flex items-center bg-slate-800 px-4 text-sm font-medium text-slate-400 border-l border-slate-700">
                .localhost
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Connect School
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {tenantSubdomain && (
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Currently connected to:{' '}
              <span className="font-semibold text-primary/80 capitalize">{tenantSubdomain}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectSchool;
