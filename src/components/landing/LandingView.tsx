import React, { useState, useEffect } from 'react';
import { Download, LayoutDashboard, ShieldCheck, Zap, Database, Code2, LineChart, Layers, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingView: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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

  const navLinks = [
    { name: 'Products', path: '/products' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-[#010f1f] text-[#d4e4fa] font-sans selection:bg-[#d0bcff]/30 overflow-x-hidden">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full z-50 bg-[#010f1f]/90 backdrop-blur-md border-b border-slate-800"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src="/logo.jpeg" alt="QAFlow Pro Logo" className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(208,188,255,0.4)]" />
            <span className="text-2xl font-bold tracking-tight text-white">QAFlow <span className="text-[#d0bcff]">Pro</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[15px] font-semibold text-slate-300">
            {navLinks.map((link) => (
              <a key={link.name} href={link.path} className="hover:text-white hover:scale-105 transition-all">
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={handleSignIn}
              className="hidden sm:block text-[15px] font-bold text-white hover:text-[#d0bcff] transition-colors"
            >
              Sign In
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallClick}
              className="px-6 py-2.5 text-[15px] font-bold bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white rounded-lg hover:shadow-[0_0_20px_rgba(255,106,0,0.5)] transition-all flex items-center gap-2"
            >
              Trials & demos <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d0bcff]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff] text-xs font-bold tracking-widest uppercase">
              <Zap className="w-4 h-4" /> Premium Enterprise Edition
            </div>
            <h1 className="text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#4facfe]">
                QA Workflow
              </span>
            </h1>
            <p className="text-xl text-[#cbc3d7] max-w-xl leading-relaxed">
              QAFlow Pro is the ultimate collaborative workspace for quality assurance teams. Track testing cycles, visualize data analytics, and manage team assignments in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="px-8 py-4 bg-[#d0bcff] text-[#381e72] text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(208,188,255,0.25)] flex items-center gap-3"
              >
                Go to Dashboard <LayoutDashboard className="w-6 h-6" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="px-8 py-4 bg-white/5 border border-slate-700 text-white text-lg font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center gap-3"
              >
                <Download className="w-6 h-6" /> Install PWA
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            {/* Abstract visual representation of the app dashboard */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative rounded-2xl border border-slate-700 bg-[#0f172a]/80 backdrop-blur-xl p-4 shadow-2xl rotate-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/5 to-transparent rounded-2xl pointer-events-none"></div>
              <div className="h-6 w-full flex items-center gap-2 mb-4 border-b border-slate-700/50 pb-4">
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
                  <div className="h-24 rounded-xl border border-slate-700/50 bg-white/5 p-4 flex items-end">
                    <div className="w-16 h-3 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-24 rounded-xl border border-slate-700/50 bg-white/5 p-4 flex items-end">
                    <div className="w-20 h-3 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 border-t border-slate-800 bg-[#010f1f]/50 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">How It Works</h2>
            <p className="text-xl text-[#cbc3d7] max-w-2xl mx-auto">A seamless pipeline bridging the gap between developers, managers, and QA engineers.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d0bcff]/30 to-transparent hidden md:block -translate-y-1/2 z-0"></div>
            
            {[
              { step: '01', title: 'Plan & Assign', desc: 'Managers create test cycles and assign testing modules to specific QA engineers.', icon: <Layers className="w-8 h-8 text-[#d0bcff]" /> },
              { step: '02', title: 'Execute & Track', desc: 'QA engineers use the visual Kanban board and Table view to pass, fail, or mark tasks as in-progress.', icon: <ShieldCheck className="w-8 h-8 text-[#d0bcff]" /> },
              { step: '03', title: 'Analyze Results', desc: 'Live data is funneled into the Analytics view, offering a real-time overview of cycle efficiency.', icon: <LineChart className="w-8 h-8 text-[#d0bcff]" /> }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative z-10 bg-[#051424] border border-slate-700 p-10 rounded-3xl shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center mb-8">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-[#d0bcff] mb-3 uppercase tracking-wider">Step {item.step}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-[#cbc3d7] text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-24 px-6 border-t border-slate-800 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/3 space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white">Modern <br/>Tech Stack</h2>
              <p className="text-xl text-[#cbc3d7] leading-relaxed">
                QAFlow Pro is built using bleeding-edge web technologies, prioritizing performance, offline accessibility, and real-time multiplayer synchronization.
              </p>
            </motion.div>
            <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { name: 'Next.js 16', icon: <Code2 className="w-6 h-6 text-white" />, color: 'from-gray-700 to-gray-900' },
                { name: 'React 19', icon: <Code2 className="w-6 h-6 text-[#61DAFB]" />, color: 'from-blue-900/50 to-slate-900' },
                { name: 'Supabase', icon: <Database className="w-6 h-6 text-[#3ECF8E]" />, color: 'from-emerald-900/40 to-slate-900' },
                { name: 'Tailwind CSS', icon: <Code2 className="w-6 h-6 text-[#38B2AC]" />, color: 'from-teal-900/40 to-slate-900' },
                { name: 'Zustand', icon: <Database className="w-6 h-6 text-[#F6C06B]" />, color: 'from-orange-900/40 to-slate-900' },
                { name: 'Recharts', icon: <LineChart className="w-6 h-6 text-[#d0bcff]" />, color: 'from-[#d0bcff]/20 to-slate-900' },
              ].map((tech, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${tech.color} border border-slate-700 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-default`}
                >
                  {tech.icon}
                  <span className="font-bold text-base text-white">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center text-[#cbc3d7] text-sm bg-[#051424]">
        <p>&copy; {new Date().getFullYear()} QAFlow Pro. Built for Enterprise Quality Assurance.</p>
      </footer>
    </div>
  );
};

