import { createClient } from '@supabase/supabase-js';

// Get environment variables (Hardcoded for Vercel deployment)
const supabaseUrl = 'https://qwvxpfisvcnutnbosdqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dnhwZmlzdmNudXRuYm9zZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjY0MTQsImV4cCI6MjA5NjUwMjQxNH0.d6Teywfp5paJ4YUEcgmT-CfIAo5myBiAgL4pM-DYTcQ';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: true,
  }
});
