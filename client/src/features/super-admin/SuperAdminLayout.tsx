import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  LifeBuoy,
  LogOut,
  ShieldAlert,
  PhoneCall
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
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Dark Sidebar specifically for Super Admin to distinguish from normal platform */}
      <aside className="w-64 flex flex-col bg-slate-900 border-r border-slate-800 z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">SaaS Admin</h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Platform Owner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
               {user?.firstName?.charAt(0)}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0B0F19]">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
