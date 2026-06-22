import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading, tenantSubdomain } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a subtle top loading bar instead of a blocking full-screen overlay
    return (
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div className="h-full bg-primary/80 animate-[progress_1s_ease-in-out_infinite]" style={{ width: '30%', marginLeft: '-30%' }}></div>
        <style>{`
          @keyframes progress {
            0% { transform: translateX(0); width: 10%; }
            50% { width: 50%; }
            100% { transform: translateX(500%); width: 10%; }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to tenant-specific login path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
