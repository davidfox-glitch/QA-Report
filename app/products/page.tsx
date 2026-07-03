"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, BarChart3, Database, Layers, ArrowLeft } from 'lucide-react';

export default function ProductsPage() {
  const features = [
    {
      title: 'Real-time Analytics',
      desc: 'Live tracking of bug cycles, testing efficiency, and module status.',
      icon: <BarChart3 className="w-8 h-8 text-[#d0bcff]" />
    },
    {
      title: 'Automated Workflows',
      desc: 'Assign test cases seamlessly and funnel data via Supabase instantly.',
      icon: <Zap className="w-8 h-8 text-[#d0bcff]" />
    },
    {
      title: 'Collaborative Environment',
      desc: 'Multiplayer synchronization ensuring the whole team is on the same page.',
      icon: <Layers className="w-8 h-8 text-[#d0bcff]" />
    },
    {
      title: 'Enterprise Security',
      desc: 'Role-based access controls and row-level security through Supabase.',
      icon: <ShieldCheck className="w-8 h-8 text-[#d0bcff]" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#010f1f] text-[#d4e4fa] font-sans selection:bg-[#d0bcff]/30">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 text-[#d0bcff] hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#4facfe]">Products</span></h1>
          <p className="text-xl text-[#cbc3d7] max-w-2xl mx-auto">
            Discover the powerful features of QAFlow Pro that will elevate your quality assurance processes to the next level.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(208,188,255,0.1)' }}
              className="bg-[#051424] border border-slate-800 p-8 rounded-3xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-[#cbc3d7] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
