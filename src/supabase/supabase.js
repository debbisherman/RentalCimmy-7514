import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fallback for development if .env isn't loaded yet
  console.warn('Supabase variables are missing from environment. Using fallback or failing.');
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);