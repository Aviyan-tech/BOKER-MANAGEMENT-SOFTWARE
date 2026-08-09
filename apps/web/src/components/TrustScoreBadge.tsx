"use client";

import React, { useState } from "react";
import { LucideShieldCheck, LucideCheckCircle2, LucideStar, LucideClock, LucideAward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrustScoreBadgeProps {
  score: number; // 0 - 100
  isVerified?: boolean;
  isPro?: boolean;
  closedDealsCount?: number;
  rating?: number;
  responseTimeMinutes?: number;
  size?: "sm" | "md" | "lg";
}

export default function TrustScoreBadge({
  score,
  isVerified = true,
  isPro = false,
  closedDealsCount = 5,
  rating = 4.8,
  responseTimeMinutes = 15,
  size = "md"
}: TrustScoreBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Score color ring
  const getScoreColor = (s: number) => {
    if (s >= 85) return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    if (s >= 70) return "text-blue-400 border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
    return "text-amber-400 border-amber-500/50 bg-amber-500/10";
  };

  return (
    <div 
      className="relative inline-block cursor-pointer select-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all ${getScoreColor(score)}`}>
        <LucideShieldCheck className="w-3.5 h-3.5" />
        <span className="text-xs font-black tracking-tight">{score}/100</span>
        <span className="text-[9px] uppercase font-bold text-white/50">Trust</span>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-3.5 rounded-2xl bg-[#090f17]/95 border border-white/15 text-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl pointer-events-none text-left space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <LucideShieldCheck className="w-4 h-4 text-emerald-400" />
                Platform Trust Score
              </span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {score}/100
              </span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between items-center text-white/80">
                <span className="flex items-center gap-1"><LucideCheckCircle2 className="w-3 h-3 text-blue-400" /> Verification Status</span>
                <span className="font-bold text-blue-300">{isVerified ? "+20 Pts (Verified)" : "0 Pts"}</span>
              </div>
              <div className="flex justify-between items-center text-white/80">
                <span className="flex items-center gap-1"><LucideAward className="w-3 h-3 text-emerald-400" /> Closed Deals</span>
                <span className="font-bold text-emerald-300">+{closedDealsCount * 5} Pts ({closedDealsCount} Deals)</span>
              </div>
              <div className="flex justify-between items-center text-white/80">
                <span className="flex items-center gap-1"><LucideStar className="w-3 h-3 text-amber-400" /> Customer Ratings</span>
                <span className="font-bold text-amber-300">+{Math.round(rating * 4)} Pts ({rating}★)</span>
              </div>
              <div className="flex justify-between items-center text-white/80">
                <span className="flex items-center gap-1"><LucideClock className="w-3 h-3 text-purple-400" /> Avg Response Time</span>
                <span className="font-bold text-purple-300">{responseTimeMinutes}m (&lt;30m fast)</span>
              </div>
            </div>

            <p className="text-[9px] text-white/40 pt-1 border-t border-white/5 text-center">
              Score is dynamically calculated based on authentic verified activity.
            </p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#090f17] border-b border-r border-white/15 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
