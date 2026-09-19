import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getProfile } from '@/lib/supabase';
import { UserProfile } from '@/lib/index';

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onboardingCompleted: boolean;
  refreshOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, specialization?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const checkOnboarding = async (userId: string, email: string) => {
    // Admin is always considered completed
    if (email === 'admin@edumk-mch.com') { setOnboardingCompleted(true); return; }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .maybeSingle();
      setOnboardingCompleted(!!data?.onboarding_completed);
    } catch { setOnboardingCompleted(false); }
  };

  const refreshOnboarding = async () => {
    if (supabaseUser) await checkOnboarding(supabaseUser.id, supabaseUser.email || '');
  };

  const loadProfile = async (supaUser: User) => {
    try {
      const profile = await getProfile(supaUser.id);
      setUser(profile as UserProfile);
    } catch (_e) {
      // Profile might not exist yet — fallback from user metadata
      const meta = supaUser.user_metadata;
      setUser({
        id: supaUser.id,
        full_name: meta?.full_name || supaUser.email?.split('@')[0] || 'مستخدم',
        email: supaUser.email || '',
        role: meta?.role || 'student',
        specialization: meta?.specialization,
        created_at: supaUser.created_at,
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        setSupabaseUser(s.user);
        Promise.all([loadProfile(s.user), checkOnboarding(s.user.id, s.user.email || '')])
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user);
        checkOnboarding(s.user.id, s.user.email || '');
      } else {
        setUser(null);
        setOnboardingCompleted(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, specialization?: string) => {
    setLoading(true);
    try {
      await signUp(email, password, name, specialization);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      user, supabaseUser, session,
      isAuthenticated: !!supabaseUser,
      isAdmin: user?.role === 'admin' ||
               supabaseUser?.user_metadata?.role === 'admin' ||
               (supabaseUser?.app_metadata as Record<string,unknown>)?.role === 'admin' ||
               supabaseUser?.email === 'admin@edumk-mch.com',
      onboardingCompleted,
      refreshOnboarding,
      login, register, logout, loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
