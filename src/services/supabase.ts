import { createClient } from '@supabase/supabase-js';
import { useSettingsStore } from '@/store/settingsStore';

// Dynamic client creator based on current settings or environment variables
export const getSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey } = useSettingsStore.getState();
  
  const url = supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return null;
  }

  try {
    return createClient(url, key);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};
