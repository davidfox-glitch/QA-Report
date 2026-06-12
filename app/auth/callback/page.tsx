'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../src/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // If we're on the client, parse the hash
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/');
        }
      });

      // Also force getSession to establish the session from the URL
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else if (typeof window !== 'undefined') {
      // If there's no token in the hash, just go to root (or login will catch it)
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Authenticating...</p>
      </div>
    </div>
  );
}
