import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideX, LucideStar, LucidePhone, LucideMail, LucideMessageCircle, LucideCalendarClock, LucideClock, LucideExternalLink } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import BrokerProBadge from "./BrokerProBadge";
import TrustScoreBadge from "./TrustScoreBadge";

interface AgentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isPro?: boolean;
  trustScore?: number;
  closedDealsCount?: number;
  rating?: number;
  avgResponseTime?: number;
  phone?: string;
}

export default function AgentPopup({ 
  isOpen, 
  onClose,
  agentName = "Sita Sharma",
  avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
  isVerified = true,
  isPro = true,
  trustScore = 96,
  closedDealsCount = 14,
  rating = 4.9,
  avgResponseTime = 5,
  phone = "+977-9801234567"
}: AgentPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md overflow-hidden rounded-3xl border-0 shadow-2xl relative glass-panel"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LucideX className="w-4 h-4" />
            </button>

            {/* Header & Photo */}
            <div className="relative h-32 bg-gradient-to-r from-emerald-900/60 to-blue-900/40">
              <div className="absolute -bottom-10 left-6">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={agentName}
                    className="w-24 h-24 rounded-full border-4 border-[#0a0f19] object-cover shadow-xl"
                  />
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0f19]" title="Online Now" />
                </div>
              </div>
            </div>

            {/* Agent Info */}
            <div className="pt-12 px-6 pb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-1.5 flex-wrap">
                    {agentName}
                    {isVerified && <VerifiedBadge size="md" />}
                    {isPro && <BrokerProBadge size="sm" />}
                  </h3>
                  <p className="text-emerald-400 text-sm font-medium">Senior Property Consultant</p>
                  <p className="text-white/50 text-xs mt-1">Platform Verified Agent • {closedDealsCount} Closed Deals</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded text-sm">
                    <LucideStar className="w-3.5 h-3.5 fill-yellow-400" /> {rating}
                  </div>
                  <TrustScoreBadge 
                    score={trustScore}
                    isVerified={isVerified}
                    isPro={isPro}
                    closedDealsCount={closedDealsCount}
                    rating={rating}
                    responseTimeMinutes={avgResponseTime}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 mb-5">
                <div className="flex-1 text-center border-r border-white/10">
                  <p className="text-white font-bold text-lg">42</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Active Listings</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-white font-bold text-lg flex items-center justify-center gap-1">
                    <LucideClock className="w-4 h-4 text-emerald-400" /> &lt;5m
                  </p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Response Time</p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-3 mb-6">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-colors"
                  style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                  <LucidePhone className="w-4 h-4" />
                  Call Now (+977-9801234567)
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-colors bg-[#25D366] hover:bg-[#20b858]">
                  <LucideMessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-colors bg-white/10 hover:bg-white/20">
                    <LucideMail className="w-4 h-4" />
                    Message
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-colors bg-white/10 hover:bg-white/20">
                    <LucideCalendarClock className="w-4 h-4" />
                    Book Visit
                  </button>
                </div>
              </div>

              {/* Footer Link */}
              <div className="text-center">
                <a href="#" className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors">
                  View Full Profile <LucideExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
