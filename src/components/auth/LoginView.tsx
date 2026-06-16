import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If Supabase redirects back to /login with an access token in the hash,
    // detect it and wait for the session to be established.
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      setLoading(true);
      
      // Manually parse the hash parameters
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })
        .then(({ data: { session }, error }) => {
          if (error) {
            console.error('Supabase manual setSession error:', error.message);
            setLoading(false);
          } else if (session) {
            // Clear hash from URL and redirect
            window.history.replaceState(null, '', window.location.pathname);
            window.location.href = '/';
          } else {
            console.warn('Session is still null after setting it manually.');
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Exception during manual setSession:', err.message);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        if (session) {
          window.location.href = '/';
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, 
      },
    });
    
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-slate-900 p-10 border border-slate-800 shadow-2xl text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 font-extrabold text-2xl shadow-lg shadow-indigo-600/20 ring-1 ring-white/10">
            QF
          </div>
          <h2 className="mt-8 text-3xl font-extrabold tracking-tight text-white font-display">
            Access QAFlow Pro
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Enterprise Testing Management Platform
          </p>
        </div>

        <div className="relative pt-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-slate-900 font-bold hover:bg-slate-50 transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 group-hover:scale-110 transition-transform" alt="Google" />
            )}
            Continue with Google
          </button>
        </div>
        
        <div className="relative pt-6 border-t border-slate-800/50 mt-8">
          <p className="text-xs leading-relaxed text-slate-500 max-w-[280px] mx-auto">
            <span className="font-semibold text-slate-400 block mb-1">Restricted Access Portal</span>
            You must have received an active system email invitation to successfully authenticate.
          </p>
        </div>
      </div>
    </div>
  );
};
