"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideCheckCircle2, LucideSparkles, LucideArrowRight } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#050b14]">
      {/* Subtle animated green glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-14">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
          >
            Upgrade Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">Broker Toolkit</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-lg max-w-xl mx-auto font-medium"
          >
            Unlock advanced features to close deals faster, manage your customers, and dominate the digital real estate market.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch justify-center w-full">
          {/* Plan 1: Growth */}
          <motion.div 
            className="w-full md:w-[45%] bg-[#0a111a] border border-white/10 rounded-3xl p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
            <p className="text-white/50 text-sm mb-6">Perfect for independent agents scaling their reach.</p>
            
            <div className="mb-6 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-white/40 line-through text-lg font-semibold">NPR 5,999</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Save 83%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white drop-shadow-md">NPR 999</span>
                <span className="text-white/50 font-medium">/mo</span>
              </div>
            </div>

            <button className="w-full py-4 rounded-2xl font-bold text-white mb-8 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              Start Growth Plan
            </button>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 flex-1">
              {[
                "Customer management",
                "Chat with other agents",
                "Deal-making tools",
                "List properties",
                "Government document generation",
                "Customer analytics"
              ].map((feature, i) => (
                <motion.div variants={itemVariants} key={i} className="flex items-start gap-3">
                  <LucideCheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm font-medium">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Plan 2: Premium */}
          <motion.div 
            className="w-full md:w-[50%] bg-[#0a141a] border-2 border-emerald-500/60 rounded-3xl p-10 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(16,185,129,0.25)] hover:border-emerald-400 md:scale-105 z-10 shadow-[0_10px_40px_rgba(16,185,129,0.15)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Glowing inner border effect */}
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_30px_rgba(16,185,129,0.1)] pointer-events-none" />

            {/* Most Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white text-xs font-bold px-5 py-2 rounded-bl-2xl flex items-center gap-1 shadow-lg overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite] skew-x-12" />
              <LucideSparkles className="w-4 h-4" /> MOST POPULAR
            </div>

            <h3 className="text-2xl font-bold text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">Premium</h3>
            <p className="text-white/50 text-sm mb-6">For top-tier agencies aiming for maximum market visibility.</p>
            
            <div className="mb-6 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-white/40 line-through text-lg font-semibold">NPR 10,999</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Save 45%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-100 drop-shadow-[0_4px_10px_rgba(16,185,129,0.4)]">NPR 5,999</span>
                <span className="text-white/60 font-medium text-lg">/mo</span>
              </div>
            </div>

            <button 
              className="w-full py-4 rounded-2xl font-black text-white mb-8 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.6)] hover:brightness-110 relative overflow-hidden group"
              style={{ background: "linear-gradient(135deg, #10b981, #047857)" }}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              Upgrade to Premium
            </button>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 flex-1">
              {[
                "Everything in Growth plan",
                "Up to 5 digital marketing videos",
                "Priority & upward recommendation",
                "Basic SEO optimization",
                "24/7 live chat support"
              ].map((feature, i) => (
                <motion.div variants={itemVariants} key={i} className="flex items-start gap-3">
                  <LucideCheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                  <span className="text-white/90 text-sm font-bold tracking-wide">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Trust Line & Skip */}
        <motion.div 
          className="mt-12 text-center space-y-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-white/40 text-sm font-medium tracking-wide">
            Cancel anytime &middot; No setup fee &middot; 500+ brokers upgraded
          </p>
          
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors text-sm font-medium">
            Skip for now <LucideArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
