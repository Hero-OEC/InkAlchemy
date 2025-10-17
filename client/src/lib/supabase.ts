import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from localStorage first, then fall back to env vars
const getSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('VITE_SUPABASE_URL');
    if (stored) return stored;
  }
  return import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
};

const getSupabaseKey = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    if (stored) return stored;
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
};

const supabaseUrl = getSupabaseUrl();
const supabaseKey = getSupabaseKey();

// Validate Supabase configuration
const isValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key';

if (!isValidConfig) {
  console.warn('⚠️  Supabase not configured. Using placeholder values. The app will show a setup screen.');
}

// Create Supabase client (will be properly configured once user provides credentials)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};