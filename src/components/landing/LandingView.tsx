import React, { useState, useEffect } from 'react';
import { Download, LayoutDashboard, ShieldCheck, Zap, Database, Code2, LineChart, Layers } from 'lucide-react';

export const LandingView: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for the PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert("App installation is not available right now. You may have already installed it, or you are using an unsupported browser.");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#010f1f] text-[#d4e4fa] font-sans selection:bg-[#d0bcff]/30">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#010f1f]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="QAFlow Pro Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-[#d0bcff]/20" />
            <span className="text-xl font-bold tracking-tight text-white">QAFlow <span className="text-[#d0bcff]">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#cbc3d7]">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSignIn}
              className="px-5 py-2.5 text-sm font-bold text-white hover:text-[#d0bcff] transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={handleInstallClick}
              className="px-5 py-2.5 text-sm font-bold bg-[#d0bcff] text-[#381e72] rounded-xl hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(208,188,255,0.3)]"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download App</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d0bcff]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff] text-xs font-bold tracking-widest uppercase">
              <Zap className="w-3.5 h-3.5" /> Premium Enterprise Edition
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-blue-400">
                QA Workflow
              </span>
            </h1>
            <p className="text-lg text-[#cbc3d7] max-w-xl leading-relaxed">
              QAFlow Pro is the ultimate collaborative workspace for quality assurance teams. Track testing cycles, visualize data analytics, and manage team assignments in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={handleSignIn}
                className="px-8 py-4 bg-[#d0bcff] text-[#381e72] font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(208,188,255,0.25)] flex items-center gap-2"
              >
                Go to Dashboard <LayoutDashboard className="w-5 h-5" />
              </button>
              <button 
                onClick={handleInstallClick}
                className="px-8 py-4 bg-white/5 border border-slate-200 dark:border-slate-700 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Install PWA
              </button>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            {/* Abstract visual representation of the app dashboard */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#0f172a]/80 backdrop-blur-xl p-4 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/5 to-transparent rounded-2xl pointer-events-none"></div>
              <div className="h-6 w-full flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 rounded-xl border border-[#d0bcff]/20 bg-[#d0bcff]/5 p-4 flex flex-col justify-end relative overflow-hidden">
                   <div className="absolute bottom-0 left-4 right-4 h-16 border-t border-l border-[#d0bcff]/30 rounded-tl-xl bg-gradient-to-tr from-[#d0bcff]/20 to-transparent"></div>
                   <div className="w-24 h-4 bg-white/20 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/5 p-4 flex items-end">
                    <div className="w-16 h-3 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-24 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/5 p-4 flex items-end">
                    <div className="w-20 h-3 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 border-t border-slate-200 dark:border-slate-700/50 bg-[#010f1f]/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">How It Works</h2>
            <p className="text-[#cbc3d7] max-w-2xl mx-auto">A seamless pipeline bridging the gap between developers, managers, and QA engineers.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d0bcff]/30 to-transparent hidden md:block -translate-y-1/2 z-0"></div>
            
            {[
              { step: '01', title: 'Plan & Assign', desc: 'Managers create test cycles and assign testing modules to specific QA engineers.', icon: <Layers className="w-6 h-6 text-[#d0bcff]" /> },
              { step: '02', title: 'Execute & Track', desc: 'QA engineers use the visual Kanban board and Table view to pass, fail, or mark tasks as in-progress.', icon: <ShieldCheck className="w-6 h-6 text-[#d0bcff]" /> },
              { step: '03', title: 'Analyze Results', desc: 'Live data is funneled into the Analytics view, offering a real-time overview of cycle efficiency.', icon: <LineChart className="w-6 h-6 text-[#d0bcff]" /> }
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-[#051424] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xl hover:-translate-y-2 transition-transform">
                <div className="w-14 h-14 rounded-xl bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-[#d0bcff] mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-[#cbc3d7] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-24 px-6 border-t border-slate-200 dark:border-slate-700/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/3 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white">Modern <br/>Tech Stack</h2>
              <p className="text-[#cbc3d7] leading-relaxed">
                QAFlow Pro is built using bleeding-edge web technologies, prioritizing performance, offline accessibility, and real-time multiplayer synchronization.
              </p>
            </div>
            <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { name: 'Next.js 16', icon: <Code2 className="w-5 h-5 text-white" />, color: 'from-gray-700 to-gray-900' },
                { name: 'React 19', icon: <Code2 className="w-5 h-5 text-[#61DAFB]" />, color: 'from-blue-900/50 to-slate-900' },
                { name: 'Supabase', icon: <Database className="w-5 h-5 text-[#3ECF8E]" />, color: 'from-emerald-900/40 to-slate-900' },
                { name: 'Tailwind CSS', icon: <Code2 className="w-5 h-5 text-[#38B2AC]" />, color: 'from-teal-900/40 to-slate-900' },
                { name: 'Zustand', icon: <Database className="w-5 h-5 text-[#F6C06B]" />, color: 'from-orange-900/40 to-slate-900' },
                { name: 'Recharts', icon: <LineChart className="w-5 h-5 text-[#d0bcff]" />, color: 'from-[#d0bcff]/20 to-slate-900' },
              ].map((tech, i) => (
                <div key={i} className={`bg-gradient-to-br ${tech.color} border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform cursor-default`}>
                  {tech.icon}
                  <span className="font-bold text-sm text-white">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 border-t border-slate-200 dark:border-slate-700/50 bg-[#010f1f]/50 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white">About Our Site</h2>
          <p className="text-lg text-[#cbc3d7] leading-relaxed">
            We developed QAFlow Pro out of a distinct need for a more intuitive, visually appealing, and real-time bug tracking platform. Existing solutions felt clunky, disconnected, and lacking in modern design aesthetics. By combining PWA capabilities, real-time database synchronization via Supabase, and the Midnight Violet premium aesthetic, we've crafted an environment where QA engineers actually <em>want</em> to spend their time.
          </p>
          <div className="pt-8">
            <button 
              onClick={handleInstallClick}
              className="px-10 py-5 text-lg font-bold bg-[#d0bcff] text-[#381e72] rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(208,188,255,0.3)] inline-flex items-center gap-3"
            >
              <Download className="w-6 h-6" /> Install QAFlow Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-700 text-center text-[#cbc3d7] text-sm">
        <p>&copy; {new Date().getFullYear()} QAFlow Pro. Built for Enterprise Quality Assurance.</p>
      </footer>
    </div>
  );
};
