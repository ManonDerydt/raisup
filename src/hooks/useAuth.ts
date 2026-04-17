import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: isSupabaseConfigured, // skip loading if Supabase not set up
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setAuthState({ user: session?.user ?? null, session, loading: false });
      })
      .catch(() => {
        setAuthState({ user: null, session: null, loading: false });
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({ user: session?.user ?? null, session, loading: false });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase non configuré — remplis front_end/.env.local') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase non configuré') };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase non configuré') };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase non configuré') };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo ?? (window.location.origin + '/loading-strategy'),
      },
    });
    return { data, error };
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };
}
