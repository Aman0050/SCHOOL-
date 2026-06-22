import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getSubdomain } from '../../lib/api';

interface Profile {
  phoneNumber?: string;
  address?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';
  tenantId: string;
  profile?: Profile;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantSubdomain: string | null;
  login: (email: string, password: string) => Promise<User | void>;
  logout: () => Promise<void>;
  setTenant: (subdomain: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(getSubdomain() || 'greenwood');

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }

    // Listener for auth token expiration (triggered in api interceptor)
    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { accessToken, user: loggedUser } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        setUser(loggedUser);
        return loggedUser;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('API logout call failed, clearing local state', err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsLoading(false);
    }
  };

  const setTenant = (subdomain: string) => {
    localStorage.setItem('tenant_subdomain', subdomain);
    setTenantSubdomain(subdomain);
    // Apply appropriate class on root element to trigger Tailwind CSS theme switches
    const rootEl = document.documentElement;
    rootEl.className = ''; // reset
    rootEl.classList.add(`theme-${subdomain}`);
  };

  // Sync theme on load
  useEffect(() => {
    if (tenantSubdomain) {
      const rootEl = document.documentElement;
      rootEl.className = '';
      rootEl.classList.add(`theme-${tenantSubdomain}`);
    }
  }, [tenantSubdomain]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        tenantSubdomain,
        login,
        logout,
        setTenant,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
