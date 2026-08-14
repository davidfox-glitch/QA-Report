import React, { useState, useEffect } from 'react';
import { Download, LayoutDashboard, ShieldCheck, Zap, Database, Code2, LineChart, Layers, ArrowRight, Clock, User, Mail, Building2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const LandingView: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeNavModal, setActiveNavModal] = useState<string | null>(null);

  // Demo Form State
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoOrg, setDemoOrg] = useState('');
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      setIsDemoModalOpen(true);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  const handleStartDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoEmail.trim()) return;

    setIsSubmittingDemo(true);
    try {
      const createDemoWorkspace = useStore.getState().createDemoWorkspace;
      createDemoWorkspace(demoName.trim(), demoEmail.trim(), demoOrg.trim() || 'Demo Sandbox Org');

      // The store method creates activeProjectId & sets active workspace
      // We force a refresh to load the app with active session
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to launch demo workspace:', err);
      setIsSubmittingDemo(false);
    }
  };

  const navLinks = [
    { name: 'Products', id: 'products' },
    { name: 'Solutions', id: 'solutions' },
    { name: 'Resources', id: 'resources' },
    { name: 'Contact', id: 'contact' }
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
              <button 
                key={link.id} 
                onClick={() => setActiveNavModal(link.id)} 
                className="hover:text-white hover:scale-105 transition-all text-left"
              >
                {link.name}
              </button>
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
              onClick={() => setIsDemoModalOpen(true)}
              className="px-6 py-2.5 text-[15px] font-bold bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white rounded-lg hover:shadow-[0_0_20px_rgba(255,106,0,0.5)] transition-all flex items-center gap-2"
            >
              Trials & demos <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
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
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-lg font-bold rounded-2xl hover:bg-amber-500/30 transition-colors flex items-center gap-3"
              >
                <Clock className="w-6 h-6 text-amber-400" /> Try 20-Min Demo Sandbox
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
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
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EPHEMERAL DEMO WORKSPACE MODAL */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0b1728] border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Instant Demo Sandbox</h3>
                  <p className="text-xs text-amber-400/90 font-medium">20-Minute Ephemeral Access</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Experience full platform features with pre-populated test data in your own isolated sandbox. The workspace self-destructs automatically after 20 minutes.
              </p>

              <form onSubmit={handleStartDemo} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Organization / Team (Optional)</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={demoOrg}
                      onChange={(e) => setDemoOrg(e.target.value)}
                      placeholder="Acme QA Team"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingDemo}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingDemo ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Launch 20-Min Demo Sandbox
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAVIGATION CONTENT MODAL */}
      <AnimatePresence>
        {activeNavModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0c1829] border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setActiveNavModal(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {activeNavModal === 'products' && (
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">QAFlow Pro Enterprise Suite</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Our platform offers real-time test execution tracking, automated AI bug summarizing via Gemini AI, visual Kanban boards, customizable analytics, and role-based access management.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400 pt-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Test Import & Gemini AI Analysis</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live Role Approval & Invitation Management</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Isolated Ephemeral Demo Workspaces</li>
                  </ul>
                </div>
              )}

              {activeNavModal === 'solutions' && (
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Solutions for QA & DevOps</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Tailored solutions designed specifically for software QA leads, test engineers, product managers, and enterprise directors to ensure zero-defect product launches.
                  </p>
                </div>
              )}

              {activeNavModal === 'resources' && (
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Documentation & Resources</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Access user manuals, API reference keys, integration setup guides, and video tutorials to help your team start tracking tests in minutes.
                  </p>
                </div>
              )}

              {activeNavModal === 'contact' && (
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Get in Touch</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Have questions about licensing, enterprise security approvals, or custom deployments? Contact our engineering team at <span className="text-indigo-400 font-semibold">admin@qaflow.com</span>.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
