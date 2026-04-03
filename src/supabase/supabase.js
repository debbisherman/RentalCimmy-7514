import { createClient } from '@supabase/supabase-js';

// Using the project-specific credentials provided in the system instructions
const SUPABASE_URL = 'https://dhfkdovavtqnxcuwrygh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZmtkb3ZhdnRxbnhjdXdyeWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzEwNzYsImV4cCI6MjA5MDY0NzA3Nn0.b41Id6HTFaUfqXGp1kTy3Rgu5_YQorhd6v5hj0D7cIA';

if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.warn('Supabase URL is not properly configured. Please connect your project.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});