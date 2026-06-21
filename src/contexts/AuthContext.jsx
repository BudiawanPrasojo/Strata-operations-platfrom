/**
 * src/contexts/AuthContext.jsx
 *
 * Menyediakan: user, session, loading, signIn, signOut
 *
 * FIX: Hanya gunakan onAuthStateChange sebagai satu-satunya
 * sumber kebenaran session. getSession() dihapus karena di
 * Supabase JS v2, onAuthStateChange sudah men-fire event
 * INITIAL_SESSION saat subscribe — menjalankan keduanya
 * menyebabkan race condition: double state-set yang membuat
 * user sesaat menjadi null → blank screen.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Satu-satunya sumber kebenaran untuk session.
    // INITIAL_SESSION event akan fire segera setelah subscribe,
    // menggantikan kebutuhan getSession() yang terpisah.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async ({ email, password }) => {
    if (!supabase) return { error: new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env') };
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
