import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate variables exist before initializing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined in your environment variables.'
  );
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: true,
  }
});
