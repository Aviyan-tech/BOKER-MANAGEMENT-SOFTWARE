"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideCheckCircle2, LucideMapPin, LucideTag, LucideCalendar, LucideUser, LucideBuilding, LucideKey, LucideExternalLink, LucideAward } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import TrustScoreBadge from "./TrustScoreBadge";
import Link from "next/link";

interface ClosedDeal {
  id: number;
  listing_id: number;
  title: string;
  location: string;
  image_url?: string;
  deal_type: string; // SALE or RENTAL
  final_price: number; // in paisa/cents
  closed_at: string;
  agent_id: number;
  agent_name: string;
  agent_avatar?: string;
  agent_is_verified: boolean;
  agent_is_pro: boolean;
  agent_trust_score: number;
  agent_total_closed_deals: number;
}

export default function ClosedDealsSection() {
  const [closedDeals, setClosedDeals] = useState<ClosedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "SALE" | "RENTAL">("ALL");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchClosedDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/v1/brokers/closed-deals`);
        if (res.ok) {
          const data = await res.json();
          setClosedDeals(data);
        }
      } catch (err) {
        console.error("Error fetching closed deals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClosedDeals();
  }, []);

  const formatPrice = (paisa: number) => {
    const r = paisa / 100;
    if (r >= 10000000) return `Rs. ${(r / 10000000).toFixed(2)} Cr`;
    if (r >= 100000) return `Rs. ${(r / 100000).toFixed(2)} Lakh`;
    return `Rs. ${r.toLocaleString()}`;
  };

  const filteredDeals = closedDeals.filter(
    (deal) => filterType === "ALL" || deal.deal_type.toUpperCase() === filterType
  );

  return (
    <div className="relative z-10 w-full my-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <LucideCheckCircle2 className="w-4 h-4 text-emerald-400" /> Platform Verified Record
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            Recently Closed Deals
          </h2>
          <p className="text-white/60 text-sm font-medium mt-1">
            Real completed sales and rental agreements verified with digital signatures.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {(["ALL", "SALE", "RENTAL"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterType === type
                  ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {type === "ALL" ? "All Deals" : type === "SALE" ? "Sales" : "Rentals"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/10">
          <LucideCheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/70 font-semibold">No verified closed deals in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-[#090f17] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-emerald-500/40 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all duration-300"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative h-48 bg-neutral-900 overflow-hidden">
                  <img
                    src={deal.image_url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop"}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090f17] via-transparent to-black/60" />

                  {/* Status & Deal Type Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-emerald-500/90 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-400 shadow-md flex items-center gap-1">
                      <LucideCheckCircle2 className="w-3 h-3" /> CLOSED & VERIFIED
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className={`font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border shadow-md flex items-center gap-1 ${
                      deal.deal_type === "RENTAL" 
                        ? "bg-purple-500/80 text-purple-200 border-purple-400" 
                        : "bg-blue-500/80 text-blue-200 border-blue-400"
                    }`}>
                      {deal.deal_type === "RENTAL" ? <LucideKey className="w-3 h-3" /> : <LucideBuilding className="w-3 h-3" />}
                      {deal.deal_type}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-2xl font-black text-white drop-shadow-md">
                      {formatPrice(deal.final_price)}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {deal.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                    <LucideMapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <span className="line-clamp-1">{deal.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[11px]">
                      <LucideCalendar className="w-3.5 h-3.5 text-white/40" />
                      Closed on {new Date(deal.closed_at).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent Footer */}
              <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={deal.agent_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${deal.agent_name}`}
                    alt={deal.agent_name}
                    className="w-9 h-9 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold text-white">
                      <span>{deal.agent_name}</span>
                      {deal.agent_is_verified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <LucideAward className="w-3 h-3" /> {deal.agent_total_closed_deals} Completed Deals
                    </span>
                  </div>
                </div>

                <Link href={`/listings/${deal.listing_id}`}>
                  <button className="p-2 rounded-xl bg-white/10 hover:bg-emerald-500 text-white/70 hover:text-white transition-colors">
                    <LucideExternalLink className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
