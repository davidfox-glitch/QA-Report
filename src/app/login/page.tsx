'use client';
import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error('Google sign‑in error:', error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-slate-100">
      <div className="w-full max-w-md p-8 bg-slate-800/60 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to QAFlow Pro</h1>
        <p className="text-center mb-8">
          Sign in with your Google account to accept the invitation and start testing.
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-transform transform hover:scale-105"
        >
          <LogIn className="h-5 w-5" />
          Sign in with Google
        </button>
        <p className="mt-6 text-sm text-slate-400 text-center">
          By signing in you agree to our{' '}
          <a href="/terms" className="underline hover:text-slate-200">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-slate-200">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
