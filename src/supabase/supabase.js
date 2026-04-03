import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * We wrap the client creation in a check to prevent the entire app 
 * from crashing if the environment variables are missing.
 */
const createSafeClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'your-project-url') {
    console.error('Supabase configuration is missing. Please check your .env file or environment variables.');
    // Return a dummy client or null to prevent immediate crash
    return null;
  }

  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const supabase = createSafeClient();