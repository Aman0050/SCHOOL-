import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../features/auth/authContext';
import { QuickActionsMenu } from '../ui/QuickActionsMenu';
import { PageSkeleton } from '../ui/skeletons/PageSkeleton';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { GlobalSearchPalette } from './GlobalSearchPalette';
import { MobileNav } from './MobileNav';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { NotificationCenter } from '../ui/NotificationCenter';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  GraduationCap,
  History,
  LogOut,
  Menu,
  X,
  School,
  User,
  BookOpen,
  Users,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  IndianRupee,
  Shield,
  Search,
  MessageSquare,
  Lock,
  LineChart,
  HeartPulse,
  CreditCard,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react';
import { GlobalSearch } from '../ui/GlobalSearch';
import { useShortcuts } from '../../hooks/useShortcuts';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const { user, logout, tenantSubdomain } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useShortcuts();
  const queryClient = useQueryClient();

  const handlePrefetch = (path: string) => {
    import('../../lib/prefetch').then(({ prefetchRoute }) => {
      prefetchRoute(path, queryClient);
    });
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      navigate('/superadmin/dashboard', { replace: true });
    } else if (user?.role === 'TEACHER') {
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleNewAnnouncement = (data: { title: string }) => {
      toast.success(`New Announcement: ${data.title}`, { icon: '📢' });
    };
    
    const handleResultsUpdated = (data: { title: string }) => {
      toast.success(`Exam Results Published: ${data.title}`, { icon: '🎓' });
    };
    
    socket.on('new_announcement', handleNewAnnouncement);
    socket.on('results_updated', handleResultsUpdated);
    
    return () => {
      socket.off('new_announcement', handleNewAnnouncement);
      socket.off('results_updated', handleResultsUpdated);
    };
  }, [socket]);

  const handleLogout = async () => {
    await logout();
    navigate('/select-school');
  };

  const menuItems = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      label: 'Students',
      path: '/dashboard/students',
      icon: Users,
      roles: ['SCHOOL_ADMIN', 'TEACHER'],
    },
    {
      label: 'Attendance',
      path: '/dashboard/attendance',
      icon: CalendarDays,
      roles: ['SCHOOL_ADMIN', 'TEACHER'],
    },


    {
      label: 'Platform Revenue',
      path: '/dashboard/platform/revenue',
      icon: LineChart,
      roles: ['SUPER_ADMIN'], // Platform Owner only
    },
    {
      label: 'Customer Success',
      path: '/dashboard/platform/success',
      icon: HeartPulse,
      roles: ['SUPER_ADMIN'],
    },

    {
      label: 'Academics',
      path: '/dashboard/academics',
      icon: BookOpen,
      roles: ['SCHOOL_ADMIN', 'TEACHER'],
    },
    {
      label: 'Examinations',
      path: '/dashboard/examinations',
      icon: ClipboardList,
      roles: ['SCHOOL_ADMIN', 'TEACHER'],
    },
    {
      label: 'Fee Management',
      path: '/dashboard/fees',
      icon: IndianRupee,
      roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'],
    },

  ];

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* 1. Desktop Sidebar */}
      <aside className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-slate-400 border-r border-slate-800 z-10 transition-transform duration-300 w-72 ${desktopCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Brand logo */}
        <div className="px-6 py-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white whitespace-nowrap">EduXENO</span>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onMouseEnter={() => handlePrefetch(item.path)}
                className={`flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {!active && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transform translate-x-1 transition-all flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout & Icons */}
        <div className="p-4 border-t border-slate-800/50 bg-[#0A1128] space-y-4">
          <div className="flex items-center justify-center gap-8 py-2">
            <Link to="/dashboard/settings" className="text-slate-400 hover:text-slate-200 transition-colors">
              <Settings className="h-5 w-5" />
            </Link>
            <NotificationCenter />
            <Link to="/dashboard/support" className="text-slate-400 hover:text-slate-200 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 1b. Mobile / Overlay Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-400 border-r border-slate-800 z-50 flex flex-col md:hidden shadow-2xl"
            >
              {/* Brand logo */}
              <div className="px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-white">EduXENO</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Sidebar Nav links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {filteredMenuItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                          : 'hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4.5 w-4.5" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. Main Content Header */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${desktopCollapsed ? 'md:pl-0' : 'md:pl-72'}`}>
        <header className="sticky top-0 z-10 flex h-[88px] bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800/50 px-4 md:px-8 items-center justify-between shadow-sm">
          {/* Left side: Mobile menu toggle or Desktop Tenant Context */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden md:flex items-center gap-4">
              <div 
                onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex-shrink-0 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Menu className="h-[22px] w-[22px]" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[22px] font-black text-slate-900 dark:text-white capitalize tracking-wide leading-tight">{tenantSubdomain}</span>
                <span className="text-[13px] font-bold text-slate-500 dark:text-slate-300">Dashboard</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Global Search Trigger */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-lg text-sm text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">⌘K</kbd>
            </button>

            <QuickActionsMenu />

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full group">
                  <div className="relative h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20 group-hover:scale-105 transition-transform">
                    <User className="h-5 w-5" />
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  </div>
                </button>
              </DropdownMenu.Trigger>
              
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[300px] bg-white dark:bg-slate-900 rounded-[24px] shadow-xl border border-slate-200 dark:border-slate-800 p-4 text-slate-900 dark:text-white animate-in fade-in slide-in-from-top-2 font-sans"
                  align="end"
                  sideOffset={12}
                >
                  {/* Header Section */}
                  <div className="flex items-center gap-4 mb-4 px-2">
                    <div className="relative h-14 w-14 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/5">
                      <User className="h-6 w-6 text-primary" />
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xl font-bold leading-tight">{user?.firstName} {user?.lastName}</p>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">{user?.role?.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2" />

                  {/* Middle Section */}
                  <div className="space-y-2 mb-4 mt-4">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-[20px] px-4 py-3.5 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                          <School className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">School</span>
                      </div>
                      <span className="text-sm font-bold capitalize">{tenantSubdomain}</span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-[20px] px-4 py-3.5 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                          <Shield className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Access ID</span>
                      </div>
                      <span className="text-sm font-mono font-bold tracking-wider">{user?.id?.split('-')[0].toUpperCase() || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <DropdownMenu.Item asChild>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-500/30 rounded-[20px] px-4 py-4 text-sm font-bold text-slate-700 dark:text-white cursor-pointer outline-none transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Secure Sign Out
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        {/* 3. Main content body */}
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <React.Suspense fallback={<PageSkeleton />}>
                <Breadcrumbs />
                <Outlet />
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GlobalSearch />
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
