"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LucideCheckCircle2, LucideMap, LucideNavigation, LucideRuler, LucideInfo,
  LucideHeart, LucideShare2, LucideChevronDown, LucideFileText, LucideMapPin,
  LucideCalculator, LucideTrendingUp, LucideArrowRight, LucideUserCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import AgentPopup from "./AgentPopup";

export default function PropertyCard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [emiMonths, setEmiMonths] = useState(120); // 10 years

  const propertyPrice = 28500000;
  const monthlyEmi = (propertyPrice * 0.09) / 12 * (emiMonths / 12); // Dummy calculation

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="absolute top-4 bottom-4 right-6 z-30 w-[420px] rounded-3xl flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20"
        style={{ background: "rgba(15, 23, 26, 0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
          
          {/* Image Carousel / Header */}
          <div className="relative h-64 bg-neutral-900 group">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop" 
              alt="Property" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f19] via-transparent to-black/40" />
            
            {/* Top Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:text-red-400 hover:bg-black/60 transition-colors">
                <LucideHeart className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-black/60 transition-colors">
                <LucideShare2 className="w-4 h-4" />
              </button>
            </div>

            {/* Badges - Conversion Focused */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-emerald-500/90 backdrop-blur-md border border-emerald-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit shadow-lg shadow-emerald-900/50">
                <LucideCheckCircle2 className="w-3 h-3" /> VERIFIED
              </span>
              <span className="bg-orange-500/90 backdrop-blur-md border border-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit shadow-lg shadow-orange-900/50 animate-pulse">
                🔥 Hot Property
              </span>
              <span className="bg-blue-500/80 backdrop-blur-md border border-blue-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-fit flex items-center gap-1">
                ⚡ High Demand
              </span>
            </div>

            {/* Social Proof (Views/Saves) */}
            <div className="absolute bottom-24 left-5 flex gap-2">
              <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold px-2 py-1 rounded-lg w-fit flex items-center gap-1">
                👀 127 Views Today
              </span>
              <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold px-2 py-1 rounded-lg w-fit flex items-center gap-1">
                ❤️ 48 Saved
              </span>
            </div>

            {/* Price & Title (Overlay) */}
            <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-white drop-shadow-lg mb-0.5">NPR 2.85 Cr</h2>
                <p className="text-emerald-400 text-sm font-bold mb-1 drop-shadow-md">1 Ropani 2 Aana (6,534 sq.ft.)</p>
                <p className="text-white/90 text-xs flex items-center gap-1 drop-shadow-md">
                  <LucideMapPin className="w-3 h-3" /> Amarsingh Chowk, Pokhara
                </p>
              </div>
              <div className="bg-red-500/90 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-bold border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                ⏳ 1 Plot Left
              </div>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="p-2 space-y-2 mt-2">

            {/* Investment Score */}
            <Accordion title="Investment Score" icon={<LucideTrendingUp className="w-4 h-4" />} defaultOpen>
              <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-black/40">
                  <span className="font-bold text-white text-sm">9.6</span>
                </div>
                <div>
                  <h4 className="text-emerald-400 font-bold text-sm">Excellent Investment</h4>
                  <p className="text-white/60 text-[10px] mt-0.5">Based on historical price trends, upcoming infrastructure (regional airport), and current market demand in Pokhara-10.</p>
                </div>
              </div>
            </Accordion>
            
            {/* Overview */}
            <Accordion title="Property Overview" icon={<LucideInfo className="w-4 h-4" />} defaultOpen>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-white/70 block mb-0.5">Land Use</span><span className="text-white font-medium">Residential</span></div>
                <div><span className="text-white/70 block mb-0.5">Shape</span><span className="text-white font-medium">Rectangular</span></div>
                <div><span className="text-white/70 block mb-0.5">Facing</span><span className="text-white font-medium">East</span></div>
                <div><span className="text-white/70 block mb-0.5">Road Access</span><span className="text-white font-medium">20 ft Blacktop</span></div>
                <div><span className="text-white/70 block mb-0.5">Frontage</span><span className="text-emerald-400 font-bold">62 ft</span></div>
                <div><span className="text-white/70 block mb-0.5">Price / Aana</span><span className="text-white font-medium">NPR 23.75 L</span></div>
              </div>
            </Accordion>

            {/* Survey Data */}
            <Accordion title="GIS Survey Data" icon={<LucideNavigation className="w-4 h-4" />}>
              <div className="bg-black/30 rounded-xl p-3 border border-white/10 space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Coordinates</span>
                  <span className="text-emerald-400 cursor-pointer hover:underline">28.2096° N, 83.9856° E</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Elevation</span>
                  <span className="text-white/90">827 m</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Survey No.</span>
                  <span className="text-white/90">3456 (Kaski)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Last Survey</span>
                  <span className="text-white/90">Jan 2026</span>
                </div>
              </div>
            </Accordion>

            {/* Documents */}
            <Accordion title="Legal Documents" icon={<LucideFileText className="w-4 h-4" />}>
              <div className="space-y-2">
                {['Lalpurja (Land Ownership)', 'Trace Map / Blueprint', 'Tax Clearance 2082'].map((doc) => (
                  <button key={doc} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/20 text-red-400 flex items-center justify-center">
                        <LucideFileText className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-white/90 font-medium">{doc}</span>
                    </div>
                    <LucideArrowRight className="w-3 h-3 text-white/50 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </Accordion>

            {/* EMI Calculator */}
            <Accordion title="Mortgage Calculator" icon={<LucideCalculator className="w-4 h-4" />}>
              <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-xs text-white/70">Est. EMI / Month</span>
                  <span className="text-xl font-bold text-white">NPR {Math.round(monthlyEmi).toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="60" max="240" step="12"
                  value={emiMonths}
                  onChange={(e) => setEmiMonths(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2"
                />
                <div className="flex justify-between text-[10px] text-white/70">
                  <span>5 Years</span>
                  <span className="text-emerald-400">{emiMonths / 12} Years @ 9%</span>
                  <span>20 Years</span>
                </div>
              </div>
            </Accordion>

          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-3 z-40 rounded-b-3xl border-t border-white/20 bg-[#0f171a] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsAgentOpen(true)}>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50&h=50&fit=crop" className="w-8 h-8 rounded-full border border-white/20" />
              <div>
                <p className="text-white text-xs font-semibold leading-tight flex items-center gap-1">Sita Sharma <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span></p>
                <p className="text-white/40 text-[9px]">Verified Agent</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAgentOpen(true)}
              className="text-emerald-400 text-[10px] font-bold uppercase tracking-wide hover:text-emerald-300"
            >
              Contact Agent
            </button>
          </div>
          
          <div className="flex gap-2 mt-1">
            <button 
              onClick={() => router.push("/checkout/PKR-AMC-2026-001")}
              className="flex-[1.5] py-3.5 rounded-2xl font-black text-white text-base shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
              style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              Buy Now / Reserve
            </button>
            <button className="flex-1 py-3.5 rounded-2xl font-bold text-white/90 text-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
              Schedule Visit
            </button>
          </div>
        </div>
      </motion.div>

      {/* Popups */}
      <AgentPopup isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} />
    </>
  );
}

// Reusable Accordion Component
function Accordion({ title, icon, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="text-emerald-400">{icon}</span>
          {title}
        </div>
        <LucideChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 pt-0 border-t border-white/5 mt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
