"use client";

import React, { useState } from "react";
import { LucideBadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function VerifiedBadge({ size = "md", showText = false, className = "" }: VerifiedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div 
      className={`relative inline-flex items-center gap-1 cursor-pointer select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative flex items-center justify-center">
        <LucideBadgeCheck className={`${iconSizes[size]} text-blue-400 fill-blue-500/20 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]`} />
      </div>

      {showText && (
        <span className="text-[11px] font-bold text-blue-400 tracking-tight">
          Verified Agent
        </span>
      )}

      {/* Interactive Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[200px] p-2.5 rounded-xl bg-slate-900/95 border border-blue-500/30 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-none text-center"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <LucideBadgeCheck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Rs. 500 Verified Agent</span>
            </div>
            <p className="text-[10px] text-white/70 leading-snug">
              Official identity & government license verified by platform administrators.
            </p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-blue-500/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
