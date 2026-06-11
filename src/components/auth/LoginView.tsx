import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/' 
          : process.env.NEXT_PUBLIC_APP_URL || 'https://qa-report-seven.vercel.app/', 
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
