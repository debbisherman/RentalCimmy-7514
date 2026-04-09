import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Enhanced Safe Client Creation
 * Prevents the app from crashing if variables are missing or malformed.
 */
const createSafeClient = () => {
  try {
    // Check if variables exist and are strings
    if (!SUPABASE_URL || typeof SUPABASE_URL !== 'string' || SUPABASE_URL.includes('your-project')) {
      console.warn('Supabase URL is missing or invalid.');
      return null;
    }

    if (!SUPABASE_ANON_KEY || typeof SUPABASE_ANON_KEY !== 'string') {
      console.warn('Supabase Anon Key is missing or invalid.');
      return null;
    }

    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Critical: Failed to initialize Supabase client:', error);
    return null;
  }
};

export const supabase = createSafeClient();