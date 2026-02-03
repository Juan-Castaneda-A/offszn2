import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

// AQUÍ ESTABA EL ERROR: Ahora incluimos las claves directamente como "fallback"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qtjpvztpgfymjhhpoouq.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0anB2enRwZ2Z5bWpoaHBvb3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODA5MTUsImV4cCI6MjA3NjM1NjkxNX0.YsItTFk3hSQaVuy707-z7Z-j34mXa03O0wWGAlAzjrw";

// Validamos que existan antes de crear el cliente para evitar el crash
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL y Key son requeridas. Revisa authStore.js");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  // Verificar sesión al cargar la app
  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user, set);
        // Sincronizar cookie por seguridad
        setAuthCookie(session.access_token);
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error("Error session:", error);
      set({ loading: false });
    }
  },

  // Iniciar Sesión Normal
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      await fetchProfile(data.user, set);
      setAuthCookie(data.session.access_token);
    }
    return data;
  },

  // Registrarse
  signUp: async (email, password, nickname) => {
    // 1. Crear usuario auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname } // Guardamos nickname en metadata
      }
    });

    if (error) throw error;
    return data;
  },

  // Login con Google (OAuth)
  signInWithGoogle: async (redirectTo = '/auth/callback') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`
      }
    });
    if (error) throw error;
    return data;
  },

  // Recuperar Contraseña
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
    return data;
  },

  // Actualizar Contraseña
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  // Cerrar Sesión
  signOut: async () => {
    await supabase.auth.signOut();
    // Limpiar cookie
    document.cookie = "sb-access-token=; path=/; max-age=0; SameSite=Strict; Secure";
    set({ user: null, profile: null });
  }
}));

// Helper para buscar datos extra del usuario (avatar, nickname) en tabla 'users'
const fetchProfile = async (user, set) => {
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Si no hay perfil en tabla users, usamos el metadata o un default
    set({ user, profile: profile || { nickname: user.user_metadata?.nickname }, loading: false });
  } catch (error) {
    set({ user, profile: { nickname: user.user_metadata?.nickname }, loading: false });
  }
};

const setAuthCookie = (token) => {
  const maxAge = 60 * 60 * 24 * 7; // 1 semana
  document.cookie = `sb-access-token=${token}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`;
};