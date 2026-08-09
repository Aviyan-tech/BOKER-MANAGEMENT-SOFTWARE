"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideTrophy, LucideFlame, LucideCheckCircle2, LucideSparkles, LucideClock, LucideStar, LucideTrendingUp, LucideAward, LucideShieldCheck } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import BrokerProBadge from "./BrokerProBadge";
import TrustScoreBadge from "./TrustScoreBadge";

interface LeaderboardBroker {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  phone_number?: string;
  is_verified: boolean;
  is_pro: boolean;
  rating: number;
  avg_response_time_minutes: number;
  trust_score: number;
  closed_deals_count: number;
  total_sales_volume: number;
  active_listings_count: number;
}

export default function TopBrokersLeaderboard() {
  const [brokers, setBrokers] = useState<LeaderboardBroker[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/v1/brokers/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setBrokers(data);
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const formatVolume = (paisa: number) => {
    const r = paisa / 100;
    if (r >= 10000000) return `Rs. ${(r / 10000000).toFixed(2)} Cr`;
    if (r >= 100000) return `Rs. ${(r / 100000).toFixed(2)} Lakh`;
    return `Rs. ${r.toLocaleString()}`;
  };

  return (
    <div className="relative z-10 w-full my-12">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <LucideTrophy className="w-4 h-4 text-amber-400 animate-bounce" /> Official Platform Leaderboard
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
          Top Deal Sold Brokers
        </h2>
        <p className="text-white/60 text-sm max-w-xl mx-auto font-medium">
          Ranked <strong className="text-amber-300 font-bold">strictly by verified completed deals</strong> — authentic sales volume with zero paid manipulation.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : brokers.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-3xl max-w-lg mx-auto border border-white/10">
          <LucideTrophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/70 font-semibold">No closed deals recorded yet.</p>
          <p className="text-xs text-white/40 mt-1">Check back once brokers start closing land deals on the platform.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8">
            {brokers.slice(0, 3).map((broker, idx) => {
              // Order: #2 Silver on Left, #1 Gold in Center, #3 Bronze on Right
              const displayRank = idx === 0 ? 1 : idx === 1 ? 2 : 3;
              const isFirst = displayRank === 1;

              const medalColors = {
                1: "from-amber-400/20 via-yellow-500/10 to-amber-600/20 border-amber-400/50 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.25)]",
                2: "from-slate-300/20 via-slate-400/10 to-slate-500/20 border-slate-300/50 text-slate-200 shadow-[0_0_20px_rgba(203,213,225,0.2)]",
                3: "from-amber-700/20 via-orange-800/10 to-amber-900/20 border-amber-600/50 text-amber-400 shadow-[0_0_20px_rgba(180,83,9,0.2)]",
              };

              const crownColors = {
                1: "text-amber-400 bg-amber-500/20 border-amber-400",
                2: "text-slate-300 bg-slate-400/20 border-slate-300",
                3: "text-amber-600 bg-amber-700/20 border-amber-600",
              };

              return (
                <motion.div
                  key={broker.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative rounded-3xl p-6 border bg-gradient-to-b backdrop-blur-xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${medalColors[displayRank as keyof typeof medalColors]} ${isFirst ? 'md:-translate-y-4 md:scale-105 z-10' : ''}`}
                >
                  {/* Rank Crown/Medal Badge */}
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-black text-sm mb-4 shadow-lg ${crownColors[displayRank as keyof typeof crownColors]}`}>
                    #{displayRank}
                  </div>

                  {/* Avatar with Verified Ring */}
                  <div className="relative mb-3">
                    <img
                      src={broker.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${broker.name}`}
                      alt={broker.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-xl"
                    />
                    {broker.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 shadow-md">
                        <VerifiedBadge size="md" />
                      </div>
                    )}
                  </div>

                  {/* Broker Name & Badges */}
                  <h3 className="text-lg font-black text-white truncate max-w-full flex items-center gap-1">
                    {broker.name}
                  </h3>

                  <div className="flex items-center justify-center gap-2 mt-1 mb-4 flex-wrap">
                    {broker.is_pro && <BrokerProBadge size="sm" />}
                    <TrustScoreBadge 
                      score={broker.trust_score} 
                      isVerified={broker.is_verified}
                      isPro={broker.is_pro}
                      closedDealsCount={broker.closed_deals_count}
                      rating={broker.rating}
                      responseTimeMinutes={broker.avg_response_time_minutes}
                    />
                  </div>

                  {/* Key Stats Grid */}
                  <div className="w-full grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-2xl border border-white/10 text-xs">
                    <div className="text-center border-r border-white/10 pr-1">
                      <span className="text-[10px] text-white/50 block font-semibold uppercase">Closed Deals</span>
                      <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
                        <LucideAward className="w-4 h-4" /> {broker.closed_deals_count}
                      </span>
                    </div>
                    <div className="text-center pl-1">
                      <span className="text-[10px] text-white/50 block font-semibold uppercase">Total Sold Volume</span>
                      <span className="text-xs font-bold text-amber-300 block truncate">
                        {formatVolume(broker.total_sales_volume)}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Response time */}
                  <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-white/60">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <LucideStar className="w-3.5 h-3.5 fill-amber-400" /> {broker.rating}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-purple-300 font-semibold">
                      <LucideClock className="w-3.5 h-3.5" /> &lt;{broker.avg_response_time_minutes}m reply
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* List for Rankings 4+ */}
          {brokers.length > 3 && (
            <div className="bg-[#090f17]/80 border border-white/10 rounded-3xl p-4 md:p-6 backdrop-blur-xl shadow-2xl space-y-3">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider px-2 mb-2">
                Honorable Top Brokers
              </h4>
              {brokers.slice(3).map((broker, idx) => (
                <div
                  key={broker.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all hover:border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white/40 w-6 text-center">
                      #{idx + 4}
                    </span>
                    <img
                      src={broker.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${broker.name}`}
                      alt={broker.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {broker.name}
                        {broker.is_verified && <VerifiedBadge size="sm" />}
                        {broker.is_pro && <BrokerProBadge size="sm" />}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                        <span>{broker.active_listings_count} Active Listings</span>
                        <span>•</span>
                        <span className="text-purple-300">&lt;{broker.avg_response_time_minutes}m response</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <TrustScoreBadge 
                      score={broker.trust_score}
                      isVerified={broker.is_verified}
                      isPro={broker.is_pro}
                      closedDealsCount={broker.closed_deals_count}
                      rating={broker.rating}
                    />
                    <div className="text-right min-w-[90px]">
                      <span className="text-sm font-black text-emerald-400 block">
                        {broker.closed_deals_count} Deals
                      </span>
                      <span className="text-[10px] text-white/50 block font-mono">
                        {formatVolume(broker.total_sales_volume)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
