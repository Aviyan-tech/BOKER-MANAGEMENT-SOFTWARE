"use client";

import React, { useState } from "react";
import { LucideSparkles, LucideCrown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BrokerProBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BrokerProBadge({ size = "md", className = "" }: BrokerProBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const badgePadding = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-2.5 py-0.5 text-[10px]",
    lg: "px-3 py-1 text-xs",
  };

  return (
    <div 
      className={`relative inline-block cursor-pointer select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`inline-flex items-center gap-1 font-black uppercase tracking-wider rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-600/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] ${badgePadding[size]}`}>
        <LucideCrown className="w-3 h-3 text-amber-300 fill-amber-300/40 animate-pulse" />
        BROKER PRO
      </span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[210px] p-2.5 rounded-xl bg-slate-900/95 border border-amber-500/30 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-none text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <LucideSparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Rs. 2,000/mo Broker Pro</span>
            </div>
            <p className="text-[10px] text-white/70 leading-snug">
              Featured placement, higher recommendation weights, property boosts, and premium analytics.
            </p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-amber-500/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
