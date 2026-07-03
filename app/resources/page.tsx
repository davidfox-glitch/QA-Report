"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Book, FileText, Video, ArrowLeft } from 'lucide-react';

export default function ResourcesPage() {
  const resources = [
    { title: 'Getting Started Guide', type: 'Documentation', icon: <Book className="w-5 h-5" /> },
    { title: 'Advanced Analytics Setup', type: 'Tutorial', icon: <FileText className="w-5 h-5" /> },
    { title: 'API Integration with Supabase', type: 'Video', icon: <Video className="w-5 h-5" /> },
    { title: 'Best Practices for Test Cases', type: 'Guide', icon: <Book className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#010f1f] text-[#d4e4fa] font-sans selection:bg-[#d0bcff]/30">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 text-[#d0bcff] hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">Resources & Support</h1>
          <p className="text-xl text-[#cbc3d7] max-w-2xl mx-auto">
            Everything you need to master QAFlow Pro and optimize your QA pipeline.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((res, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-[#051424] border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-[#d0bcff]/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#d0bcff] mb-4">
                {res.icon}
              </div>
              <div className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-wider">{res.type}</div>
              <h3 className="text-lg font-bold text-white">{res.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
