import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { LogOut, Sparkles, Clock, ShieldCheck, User, Mail, UserCheck, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface RegistrationFlowProps {
  session: any;
  onSignOut: () => void;
}

export function RegistrationFlow({ session, onSignOut }: RegistrationFlowProps) {
  const [name, setName] = useState(session?.user?.user_metadata?.full_name || '');
  const [role, setRole] = useState<'QA Superior' | 'Manager' | 'Boss' | 'QA' | 'Developer' | 'Client'>('QA');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const email = session.user.email;
      const avatar = session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

      const { error } = await supabase.from('users').insert({
        name,
        email,
        role,
        avatar,
        is_approved: false
      });

      if (error) {
        throw error;
      }

      toast.success('Registration request submitted successfully!');
      // Force store refresh to update users state
      await useStore.getState().fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit registration request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Premium Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-950/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-7 w-7 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            Request Platform Access
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Welcome to QAFlow Pro. Complete this form to submit your account request to the administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-slate-500" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm font-medium transition-all text-white placeholder-slate-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-500" />
              </span>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full pl-11 pr-4 py-3 bg-slate-900/20 border border-slate-800/50 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Your email is authenticated and locked via provider login.
            </p>
          </div>

          {/* Requested Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Requested Platform Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm font-medium transition-all text-white"
              disabled={loading}
            >
              <option value="QA">QA Tester (Regular)</option>
              <option value="QA Superior">QA Superior (Lead)</option>
              <option value="Developer">Developer</option>
              <option value="Manager">Manager</option>
              <option value="Boss">Boss / Executive</option>
              <option value="Client">Client / stakeholder</option>
            </select>
          </div>

          {/* Business Reason */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Purpose / Reason for Access
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Joining the QA testing team for the new app release..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm font-medium transition-all text-white placeholder-slate-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-550/30 flex items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Submit Access Request
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer actions */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between items-center">
          <button
            onClick={onSignOut}
            className="text-xs font-bold text-slate-500 hover:text-rose-500 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <div className="text-[10px] text-slate-600 font-medium">
            System ID: {session?.user?.id?.substring(0, 8)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AwaitingApprovalViewProps {
  session: any;
  onSignOut: () => void;
}

export function AwaitingApprovalView({ session, onSignOut }: AwaitingApprovalViewProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Premium Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        
        {/* Glow pulsing circle */}
        <div className="relative flex justify-center mb-6">
          <div className="absolute inset-0 h-16 w-16 mx-auto bg-amber-500/20 rounded-full blur-xl animate-pulse" />
          <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 relative">
            <Clock className="h-8 w-8 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Messaging */}
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Account Under Review
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Hi, <span className="font-semibold text-slate-200">{session?.user?.user_metadata?.full_name || 'there'}</span>. Your platform request is pending administrator approval.
        </p>

        {/* Info panel */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4.5 mb-6 text-left space-y-3">
          <div className="flex items-center gap-3">
            <UserCheck className="h-4 w-4 text-indigo-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Email Address</div>
              <div className="text-xs font-semibold text-slate-200">{session?.user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Real-time Sync</div>
              <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping inline-block" />
                Listening for admin approval...
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Our systems are listening for approval changes. You will be automatically redirected to your workspace the moment the administrator grants access.
        </p>

        {/* Actions */}
        <div className="border-t border-slate-900 pt-6 flex justify-between items-center">
          <button
            onClick={onSignOut}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <div className="text-[10px] text-slate-600 font-semibold">
            Status: PENDING
          </div>
        </div>
      </div>
    </div>
  );
}
