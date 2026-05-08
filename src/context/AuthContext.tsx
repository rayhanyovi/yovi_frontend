'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login, getMe, DEMO_PASSWORD } from '@/lib/api/auth';
import { getUsers, User } from '@/lib/api/users';

interface AuthContextValue {
  user: User | null;
  users: User[];
  isLoading: boolean;
  switchUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_EMAIL = 'john@example.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const doLogin = useCallback(async (email: string) => {
    const { token, user: loggedIn } = await login(email, DEMO_PASSWORD);
    localStorage.setItem('token', token);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const [allUsers] = await Promise.all([getUsers()]);
        setUsers(allUsers);

        const stored = localStorage.getItem('token');
        if (stored) {
          try {
            const me = await getMe();
            setUser(me);
          } catch {
            localStorage.removeItem('token');
            await doLogin(DEFAULT_EMAIL);
          }
        } else {
          await doLogin(DEFAULT_EMAIL);
        }
      } catch (err) {
        console.error('Auth init failed', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [doLogin]);

  const switchUser = useCallback(async (target: User) => {
    setIsLoading(true);
    await doLogin(target.email);
    window.location.reload();
  }, [doLogin]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('token');
      queryClient.invalidateQueries();
      await doLogin(DEFAULT_EMAIL);
    } finally {
      setIsLoading(false);
    }
  }, [doLogin, queryClient]);

  return (
    <AuthContext.Provider value={{ user, users, isLoading, switchUser, logout }}>
      {isLoading && !user ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 text-sm font-medium text-gray-600">
          Loading...
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
