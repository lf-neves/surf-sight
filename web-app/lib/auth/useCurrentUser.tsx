'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  useMeQuery,
  type MeQuery,
} from '@/lib/graphql/generated/apollo-graphql-hooks';

type User = NonNullable<MeQuery['me']>;

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  // Get token from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }
  }, []);

  // Query current user if token exists
  const { data, loading, refetch } = useMeQuery({
    skip: !token,
    fetchPolicy: 'network-only',
    onError: () => {
      // If query fails, clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
      }
    },
  });

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      window.location.href = '/login';
    }
  };

  // Update token when it changes in localStorage (e.g., after login)
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
      if (newToken) {
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('auth-token-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-token-updated', handleStorageChange);
    };
  }, [refetch]);

  const value: AuthContextType = {
    currentUser: data?.me ? (data.me as User) : null,
    isAuthenticated: !!data?.me && !!token,
    isLoading: loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within an AuthProvider');
  }
  return context;
}
