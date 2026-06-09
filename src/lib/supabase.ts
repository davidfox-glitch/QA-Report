import { createClient } from '@supabase/supabase-js';

// Get VAPID keys from environment variables
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
const VAPID_PRIVATE_KEY = import.meta.env.VITE_VAPID_PRIVATE_KEY as string;

export const supabase = createClient(
  'https://qwvxpfisvcnutnbosdqz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dnhwZmlzdmNudXRuYm9zZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjY0MTQsImV4cCI6MjA5NjUwMjQxNH0.d6Teywfp5paJ4YUEcgmT-CfIAo5myBiAgL4pM-DYTcQ',
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
