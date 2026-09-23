import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../types';

const API_BASE = 'http://localhost:5001';

const TOKEN_KEY = 'roboexpert_token';
const REFRESH_KEY = 'roboexpert_refresh';
const USER_KEY = 'roboexpert_user';

export type LoginResult =
  | { success: true; role: 'seller' | 'admin'; user: AuthUser }
  | { success: false; error: string };

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (stored && token) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore corrupt storage
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.ok) {
        return {
          success: false,
          error: data?.error ?? 'Login failed',
        };
      }

      const authUser: AuthUser = data.user;
      const accessToken: string = data.accessToken;
      const refreshToken: string = data.refreshToken;

      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      setUser(authUser);

      return {
        success: true,
        role: authUser.role,
        user: authUser,
      };
    } catch (error) {
      console.error('login error:', error);
      return { success: false, error: 'Network error — please try again' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {
          // ignore — we clear locally anyway
        });
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}