"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideX, LucideBadgeCheck, LucideTrophy, LucideCheckCircle2, LucideSparkles, LucideCreditCard, LucideSmartphone, LucideShieldCheck, LucideArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface BrokerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BrokerVerificationModal({ isOpen, onClose, onSuccess }: BrokerVerificationModalProps) {
  const { user, fetchWithAuth } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"VERIFIED" | "TOP_BROKER">("VERIFIED");
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleUpgrade = async () => {
    // TOP_BROKER plan is not paid here — payment is triggered from the deal-closing flow
    if (selectedPlan === "TOP_BROKER") return;

    setIsProcessing(true);
    try {
      const endpoint = "/api/v1/brokers/verify";
      const res = await fetchWithAuth(`${API_URL}${endpoint}`, {
        method: "POST"
      });

      if (res.ok) {
        alert("Successfully purchased Verified Agent status!");
        if (onSuccess) onSuccess();
        onClose();
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.detail || "Payment failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#090f17] border border-white/15 rounded-[2.5rem] p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-white overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <LucideX className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <LucideShieldCheck className="w-4 h-4 text-blue-400" /> Premium Broker Subscriptions
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Upgrade Your Broker Status
            </h2>
            <p className="text-xs text-white/60 max-w-md mx-auto">
              Boost your trust score, rank higher on recommendations, and unlock blue verification badges.
            </p>
          </div>

          {/* Plan Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

            {/* Plan 1: Verified Agent */}
            <div
              onClick={() => setSelectedPlan("VERIFIED")}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                selectedPlan === "VERIFIED"
                  ? "bg-blue-500/10 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <LucideBadgeCheck className="w-8 h-8 text-blue-400" />
                <span className="text-xs font-black text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2.5 py-1 rounded-full">
                  Rs. 500 / Lifetime
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Verified Agent</h3>
              <p className="text-xs text-white/60 mb-4">Official blue badge verification to establish instant client trust.</p>
              
              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex items-center gap-2"><LucideCheckCircle2 className="w-4 h-4 text-blue-400" /> Official Blue Verified Badge</li>
                <li className="flex items-center gap-2"><LucideCheckCircle2 className="w-4 h-4 text-blue-400" /> +20 Trust Score Boost</li>
                <li className="flex items-center gap-2"><LucideCheckCircle2 className="w-4 h-4 text-blue-400" /> Verified Agent Badge on Popups</li>
              </ul>
            </div>

            {/* Plan 2: Top Broker (Pay on Close) */}
            <div
              onClick={() => setSelectedPlan("TOP_BROKER")}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                selectedPlan === "TOP_BROKER"
                  ? "bg-amber-500/10 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <LucideTrophy className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-black text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-full">
                  Rs. 2,000 / Closed Deal
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Top Broker</h3>
              <p className="text-xs text-white/60 mb-4">Pay only when a deal closes — no upfront cost, rewarded for results.</p>

              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex items-center gap-2"><LucideSparkles className="w-4 h-4 text-amber-400" /> Verified Deal Badge on closed deals</li>
                <li className="flex items-center gap-2"><LucideSparkles className="w-4 h-4 text-amber-400" /> Top Broker ranking for sold deals</li>
                <li className="flex items-center gap-2"><LucideSparkles className="w-4 h-4 text-amber-400" /> Auto-filled deal documents</li>
                <li className="flex items-center gap-2"><LucideSparkles className="w-4 h-4 text-amber-400" /> Deal added to profile record</li>
              </ul>

              <p className="mt-4 text-[10px] text-amber-400/70 italic">
                Charged automatically when you close a deal — not here.
              </p>
            </div>

          </div>

          {/* Payment Method Selector (only shown for VERIFIED plan) */}
          {selectedPlan === "VERIFIED" && (
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">Select Payment Gateway</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("esewa")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    paymentMethod === "esewa" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-black/40 text-white/60"
                  }`}
                >
                  <LucideSmartphone className="w-4 h-4" /> eSewa Mobile Wallet
                </button>

                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    paymentMethod === "bank" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-black/40 text-white/60"
                  }`}
                >
                  <LucideCreditCard className="w-4 h-4" /> ConnectIPS / Bank Direct
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {selectedPlan === "VERIFIED" ? (
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl font-black text-white text-base transition-all flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>Confirm Payment (NPR 500)</>
              )}
            </button>
          ) : (
            <a
              href="/dashboard/deals"
              onClick={onClose}
              className="w-full py-4 rounded-xl font-black text-white text-base transition-all flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-amber-600 to-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              Go to My Deals to Close &amp; Pay
              <LucideArrowRight className="w-5 h-5" />
            </a>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
