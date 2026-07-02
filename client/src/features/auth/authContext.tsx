import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api, { getSubdomain } from '../../lib/api';

interface Profile {
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';
  tenantId: string;
  mfaEnabled?: boolean;
  preferences?: any;
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

  const refreshUser = useCallback(async () => {
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
  }, []);

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

    // Listener for cross-tab logout (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
      }
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        if (response.data.data.mfaRequired || response.data.data.mfaSetupRequired) {
          throw new Error(response.data.data.message || 'MFA is required but not supported in this client version.');
        }
        const { accessToken, user: loggedUser } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        setUser(loggedUser);
        return loggedUser;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
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
  }, []);

  const setTenant = useCallback((subdomain: string) => {
    localStorage.setItem('tenant_subdomain', subdomain);
    setTenantSubdomain(subdomain);
    // Apply appropriate class on root element to trigger Tailwind CSS theme switches
    const rootEl = document.documentElement;
    rootEl.className = ''; // reset
    rootEl.classList.add(`theme-${subdomain}`);
  }, []);

  // Sync theme on load
  useEffect(() => {
    if (tenantSubdomain) {
      const rootEl = document.documentElement;
      rootEl.className = '';
      rootEl.classList.add(`theme-${tenantSubdomain}`);
    }
  }, [tenantSubdomain]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    tenantSubdomain,
    login,
    logout,
    setTenant,
    refreshUser,
  }), [user, isLoading, tenantSubdomain, login, logout, setTenant, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
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
