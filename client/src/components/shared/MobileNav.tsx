import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageSquare, Menu, Plus } from 'lucide-react';
import { useAuth } from '../../features/auth/authContext';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine base path depending on role
  let basePath = '/dashboard';
  if (user?.role === 'TEACHER') basePath = '/teacher';
  if (user?.role === 'PARENT' || user?.role === 'STUDENT') basePath = '/portal';

  const navItems = [
    { name: 'Home', path: basePath, icon: <Home className="w-6 h-6" /> },
    { name: 'Academics', path: `${basePath}/academics`, icon: <BookOpen className="w-6 h-6" /> },

    { name: 'Menu', path: `${basePath}/menu`, icon: <Menu className="w-6 h-6" /> },
  ];

  return (
    <>
      {/* Global Floating Action Button (FAB) for mobile */}
      <button 
        className="md:hidden fixed bottom-20 right-4 z-50 p-4 bg-primary text-white rounded-full shadow-xl hover:bg-primary active:scale-95 transition-all"
        onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
        aria-label="Quick Actions"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== basePath && location.pathname.startsWith(item.path));
              
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive 
                    ? 'text-primary dark:text-primary' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
