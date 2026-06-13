import { createClient } from '@supabase/supabase-js';

// Get VAPID keys from environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key',
  {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: true,
    },
  }
);

export const vapidKeys = {
  publicKey: VAPID_PUBLIC_KEY,
  privateKey: VAPID_PRIVATE_KEY,
};

// Global channel for Realtime State Sync
export const syncChannel = supabase.channel('app-state-sync');
