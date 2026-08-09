"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideSearch, LucideShield, LucideMapPin } from "lucide-react";
import HeroMap3D from "./HeroMap3D";

interface Props {
  search: string;      setSearch: (v: string) => void;
  landType: string;    setLandType: (v: string) => void;
  priceMin: string;    setPriceMin: (v: string) => void;
  priceMax: string;    setPriceMax: (v: string) => void;
}

export default function HeroBanner({
  search, setSearch, landType, setLandType,
  priceMin, setPriceMin, priceMax, setPriceMax,
}: Props) {
  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ minHeight: "100vh" }}
    >
      {/* 3D Map Background Layer */}
      <div className="absolute inset-0 z-0">
        <HeroMap3D />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 6 — Subtle Left Gradient for Text Readability
      ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-y-0 left-0 pointer-events-none z-10" style={{
        width: "35%",
        background: "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)",
      }} />

      {/* top + bottom vignettes */}
      <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: "15%", background: "linear-gradient(180deg,rgba(3,8,16,0.2) 0%,transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: "15%", background: "linear-gradient(0deg,rgba(3,8,16,0.3) 0%,transparent 100%)" }} />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT — left side (Floating Elements)
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex flex-col justify-center min-h-screen px-8 md:px-14 lg:px-20 py-24 max-w-2xl pointer-events-none">

        {/* trusted badge */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 w-fit backdrop-blur-sm"
          style={{ background: "rgba(22,163,74,0.18)", border: "1px solid rgba(74,222,128,0.35)" }}
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide" style={{ color: "#86efac" }}>
            Nepal's #1 Trusted Property Platform
          </span>
          <LucideShield className="h-3.5 w-3.5 text-green-400" />
        </motion.div>

        {/* headline */}
        <motion.h1
          className="font-black leading-tight tracking-tight mb-4 pointer-events-auto"
          style={{ fontSize: "clamp(2.2rem,4.5vw,4rem)", color: "#FFFFFF", textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
        >
          Find Verified<br />
          <span style={{ color: "#34d399" }}>Land &amp; Property</span><br />
          <span style={{ color: "rgba(255,255,255,0.95)" }}>Across Nepal</span>
        </motion.h1>

        {/* Nepali tagline */}
        <motion.p className="text-xl font-bold mb-2 pointer-events-auto"
          style={{ color: "#FFFFFF", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          विश्वास तपाईको, घर हाम्रो
        </motion.p>

        <motion.p className="text-base mb-8 max-w-sm leading-relaxed font-medium pointer-events-auto"
          style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.5 }}
        >
          Buy, sell, negotiate live &amp; hire agents. All land documents verified.
          सुरक्षित कारोबार, भरपर्दो सेवा।
        </motion.p>

        {/* current slide location badge — animates per slide */}
        <AnimatePresence mode="wait">
          <motion.div
            className="inline-flex items-center gap-2 mb-7 w-fit"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.4 }}
          >
            <LucideMapPin className="h-4 w-4 flex-shrink-0" style={{ color: "#4ade80" }} />
            <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
              Amarsingh Chowk, Pokhara
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
              style={{ background: "rgba(22,163,74,0.22)", color: "#86efac", border: "1px solid rgba(74,222,128,0.3)" }}>
              1.2 ROPANI
            </span>
          </motion.div>
        </AnimatePresence>

        {/* feature pills */}
        <motion.div className="flex flex-wrap gap-2 mb-7"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
          {[
            { en: "🏠 BUY",       np: "किन्नुहोस्",    c: "rgba(59,130,246,0.22)", b: "rgba(59,130,246,0.45)" },
            { en: "💰 SELL",      np: "बेच्नुहोस्",    c: "rgba(34,197,94,0.18)",  b: "rgba(34,197,94,0.42)" },
            { en: "💬 CHAT",      np: "कुरा गर्नुहोस्",c: "rgba(168,85,247,0.18)", b: "rgba(168,85,247,0.42)" },
            { en: "🤝 NEGOTIATE", np: "सम्झौता",        c: "rgba(251,191,36,0.18)", b: "rgba(251,191,36,0.50)" },
            { en: "🔑 HIRE",      np: "भाडामा",         c: "rgba(239,68,68,0.18)",  b: "rgba(239,68,68,0.42)" },
          ].map((f) => (
            <span key={f.en}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm flex items-center gap-1.5"
              style={{ background: f.c, border: `1px solid ${f.b}` }}>
              {f.en} <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.52)" }}>{f.np}</span>
            </span>
          ))}
        </motion.div>

        {/* search panel */}
        <motion.div
          className="rounded-3xl p-4 mb-6 glass-panel max-w-lg shadow-[0_20px_40px_rgba(0,0,0,0.25)] pointer-events-auto"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <LucideSearch className="absolute left-4 top-3.5 h-4 w-4" style={{ color: "rgba(255,255,255,0.32)" }} />
              <input
                type="text" placeholder="Search location, city, district…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none placeholder-white/30"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
              />
            </div>
            <select value={landType} onChange={(e) => setLandType(e.target.value)}
              className="rounded-2xl py-3 px-4 text-white text-sm focus:outline-none appearance-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", minWidth: 128 }}>
              <option value="" className="bg-gray-900">All Types</option>
              <option value="residential" className="bg-gray-900">Residential</option>
              <option value="commercial" className="bg-gray-900">Commercial</option>
              <option value="agricultural" className="bg-gray-900">Agricultural</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Min Price (Rs.)" value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="flex-1 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none placeholder-white/30"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }} />
            <input type="number" placeholder="Max Price (Rs.)" value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="flex-1 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none placeholder-white/30"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }} />
            <button
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 0 22px rgba(22,163,74,0.45)" }}>
              <LucideSearch className="h-4 w-4" /> Search
            </button>
          </div>
        </motion.div>

        {/* stats */}
        <motion.div className="flex flex-wrap gap-4 pointer-events-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.68, duration: 0.5 }}>
          {[
            { v: "500+", l: "Verified Plots" },
            { v: "77",   l: "Districts" },
            { v: "98%",  l: "Secure Deals" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center justify-center glass-panel rounded-2xl px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <span className="text-2xl font-black text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>{s.v}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#34d399" }}>{s.l}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 opacity-45">
        <span className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Scroll</span>
        <div className="h-5 w-px animate-pulse"
          style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.45),transparent)" }} />
      </div>
    </div>
  );
}
