"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#010f1f] text-[#d4e4fa] font-sans selection:bg-[#d0bcff]/30">
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 text-[#d0bcff] hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[#051424] border border-slate-800 p-10 rounded-3xl shadow-2xl"
        >
          <h1 className="text-4xl font-extrabold text-white mb-2">Get in touch</h1>
          <p className="text-[#cbc3d7] mb-8">Want to learn more about our Enterprise edition? Drop us a message.</p>

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-center font-semibold"
            >
              Thank you! Your message has been received. We will get back to you shortly.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#cbc3d7] mb-2">First Name</label>
                  <input required type="text" className="w-full bg-[#010f1f] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d0bcff] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cbc3d7] mb-2">Last Name</label>
                  <input required type="text" className="w-full bg-[#010f1f] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d0bcff] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbc3d7] mb-2">Email Address</label>
                <input required type="email" className="w-full bg-[#010f1f] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d0bcff] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbc3d7] mb-2">Message</label>
                <textarea required rows={4} className="w-full bg-[#010f1f] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d0bcff] transition-colors"></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#d0bcff] to-[#4facfe] text-[#010f1f] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
