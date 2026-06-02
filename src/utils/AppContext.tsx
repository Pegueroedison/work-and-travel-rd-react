import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ToastItem, User } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { getCurrentProfile, signInWithEmail, signOut, signUpWithEmail, updateMyProfile } from '@/services/supabaseApi';

interface AppContextValue {
  currentUser: User | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  saveProfile: (values: Partial<User>) => Promise<User | null>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { theme, toggle: toggleTheme } = useTheme();
  const { toasts, show, dismiss } = useToast();

  const refreshProfile = useCallback(async () => {
    setAuthLoading(true);
    try {
      const profile = await getCurrentProfile();
      setCurrentUser(profile);
      return profile;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
    if (!supabase) return undefined;
    const { data } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshProfile(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
    await refreshProfile();
  }, [refreshProfile]);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    await signUpWithEmail(email, password, fullName);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    await signOut();
    setCurrentUser(null);
  }, []);

  const saveProfile = useCallback(async (values: Partial<User>) => {
    const profile = await updateMyProfile(values);
    if (profile) setCurrentUser(profile);
    return profile;
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    currentUser,
    isLoggedIn: !!currentUser,
    authLoading,
    login,
    register,
    logout,
    refreshProfile,
    saveProfile,
    theme,
    toggleTheme,
    toasts,
    showToast: show,
    dismissToast: dismiss,
  }), [authLoading, currentUser, dismiss, login, logout, refreshProfile, register, saveProfile, show, theme, toggleTheme, toasts]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
