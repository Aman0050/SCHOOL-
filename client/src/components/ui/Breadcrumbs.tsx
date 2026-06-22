import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are at the root or just /dashboard, don't show full breadcrumb or keep it minimal
  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/dashboard" className="inline-flex items-center text-sm font-medium hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          if (name === 'dashboard') return null; // Skip 'dashboard' as it's our home

          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

          return (
            <li key={name}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-slate-400" />
                {isLast ? (
                  <span className="ml-1 text-sm font-semibold text-slate-900 md:ml-2 dark:text-white">
                    {formattedName}
                  </span>
                ) : (
                  <Link to={routeTo} className="ml-1 text-sm font-medium hover:text-primary md:ml-2 dark:text-slate-400 dark:hover:text-white transition-colors">
                    {formattedName}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
