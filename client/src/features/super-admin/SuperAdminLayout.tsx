import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  LifeBuoy,
  LogOut,
  ShieldAlert,
  PhoneCall,
  Database,
  User,
  Shield
} from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Control Center', path: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Schools', path: '/superadmin/schools', icon: Building2 },
    { label: 'Billing & Subscriptions', path: '/superadmin/billing', icon: CreditCard },
    { label: 'Demo Requests', path: '/superadmin/demo-requests', icon: PhoneCall },
    { label: 'Support Desk', path: '/superadmin/support', icon: LifeBuoy },
    { label: 'Security & Audit', path: '/superadmin/audit', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans selection:bg-primary/30">
      
      {/* Dark Sidebar specifically for Super Admin to distinguish from normal platform */}
      <aside className="w-64 flex flex-col bg-slate-950 border-r border-slate-900 z-20">
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">Sufyan Khan</h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Platform Owner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-end px-8 z-10 sticky top-0">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full group pr-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-700">{user?.firstName === 'Super' ? 'Aman' : (user?.firstName || 'Aman')} {user?.lastName === 'Admin' ? 'Qureshi' : (user?.lastName || 'Qureshi')}</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">{user?.role?.replace('_', ' ')}</span>
                </div>
                <div className="relative h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20 group-hover:scale-105 transition-transform">
                  <User className="h-5 w-5" />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
              </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[300px] bg-white rounded-[24px] shadow-xl border border-slate-200 p-4 text-slate-900 animate-in fade-in slide-in-from-top-2 font-sans mr-4 mt-2"
                align="end"
                sideOffset={12}
              >
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-4 px-2">
                  <div className="relative h-14 w-14 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/5">
                    <User className="h-6 w-6 text-primary" />
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xl font-bold leading-tight">{user?.firstName === 'Super' ? 'Aman' : (user?.firstName || 'Aman')} {user?.lastName === 'Admin' ? 'Qureshi' : (user?.lastName || 'Qureshi')}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-2 mx-2" />

                {/* Middle Section */}
                <div className="space-y-2 mb-4 mt-4">
                  <div className="flex items-center justify-between bg-slate-50 rounded-[20px] px-4 py-3.5 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Shield className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Access ID</span>
                    </div>
                    <span className="text-sm font-mono font-bold tracking-wider">{user?.id?.split('-')[0].toUpperCase() || 'N/A'}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <DropdownMenu.Item asChild>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-100 hover:border-red-200 rounded-[20px] px-4 py-4 text-sm font-bold text-slate-700 cursor-pointer outline-none transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Secure Sign Out
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/30"></div></div>}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
