"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Activity, ArrowLeft } from 'lucide-react';

export default function SolutionsPage() {
  const points = [
    {
      title: 'For QA Managers',
      desc: 'Get a bird\'s-eye view of testing cycles. Track efficiency and quickly identify bottlenecks.',
      icon: <Users className="w-6 h-6 text-white" />
    },
    {
      title: 'For QA Engineers',
      desc: 'Execute test cases with a streamlined interface. Add screenshots, notes, and fail reasons without friction.',
      icon: <CheckCircle className="w-6 h-6 text-white" />
    },
    {
      title: 'For Stakeholders',
      desc: 'View real-time generated reports and live analytics dashboards directly without leaving the app.',
      icon: <Activity className="w-6 h-6 text-white" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#010f1f] text-[#d4e4fa] font-sans selection:bg-[#d0bcff]/30">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 text-[#d0bcff] hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">Built for every <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#4facfe]">Role</span></h1>
          <p className="text-xl text-[#cbc3d7] max-w-2xl">
            QAFlow Pro bridges the gap between management and engineering, providing specialized tools tailored to your specific role in the software lifecycle.
          </p>
        </motion.div>

        <div className="space-y-6">
          {points.map((pt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
              className="bg-gradient-to-r from-[#051424] to-[#0a1f38] border border-slate-800 p-8 rounded-3xl flex items-start gap-6"
            >
              <div className="mt-1 w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#d0bcff]/40 to-indigo-600/40 flex items-center justify-center">
                {pt.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{pt.title}</h3>
                <p className="text-[#cbc3d7] text-lg">{pt.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
