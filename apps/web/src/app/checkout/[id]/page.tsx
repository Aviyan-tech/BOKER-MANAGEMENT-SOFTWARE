"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LucideShieldCheck, LucideCreditCard, LucideArrowLeft, LucideBuilding, LucideSmartphone, LucideCheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-black/60 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-md"
        >
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LucideCheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Reservation Confirmed!</h2>
          <p className="text-white/60 text-sm mb-6">
            You have successfully reserved Property ID: <strong>{params.id}</strong>. Our agent Sita Sharma will contact you shortly to finalize the paperwork.
          </p>
          <Link href="/">
            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors">
              Return Home
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
        
        {/* Left Column: Property Summary */}
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
            <LucideArrowLeft className="w-4 h-4" /> Back to Listing
          </button>
          
          <h1 className="text-3xl font-black text-white mb-2">Reserve Property</h1>
          <p className="text-white/50 mb-8">Secure this property by placing a refundable booking deposit. This ensures the property is taken off the market for 7 days.</p>

          <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="h-40 bg-neutral-900 relative">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-emerald-500/90 text-[10px] font-bold px-2 py-0.5 rounded text-white mb-1 inline-block">VERIFIED PROPERTY</span>
                <h3 className="text-white font-bold text-lg">Amarsingh Chowk, Pokhara</h3>
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/50">Property ID</span>
                <span className="text-white font-mono">{params.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/50">Total Area</span>
                <span className="text-white">1 Ropani 2 Aana</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/50">Total Estimated Price</span>
                <span className="text-white font-bold">NPR 2.85 Crore</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/80 font-bold text-lg">Booking Deposit Amount</span>
                <span className="text-emerald-400 font-black text-2xl">NPR 1,00,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Buyer Details */}
        <div>
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LucideShieldCheck className="w-5 h-5 text-emerald-400" /> Secure Checkout
            </h2>

            {/* Buyer Details Form */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-white/70 border-b border-white/10 pb-2">Buyer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-white/50 uppercase">First Name</label>
                  <input type="text" defaultValue="John" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 uppercase">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase">Phone Number</label>
                <input type="text" defaultValue="+977 9800000000" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-white/70 border-b border-white/10 pb-2">Payment Method</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setPaymentMethod("esewa")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${paymentMethod === 'esewa' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}
                >
                  <LucideSmartphone className={`w-5 h-5 ${paymentMethod === 'esewa' ? 'text-emerald-400' : 'text-white/40'}`} />
                  <div className="text-left">
                    <p className="text-white text-sm font-bold">eSewa Mobile Wallet</p>
                    <p className="text-white/40 text-[10px]">Pay instantly via eSewa app</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setPaymentMethod("bank")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}
                >
                  <LucideBuilding className={`w-5 h-5 ${paymentMethod === 'bank' ? 'text-emerald-400' : 'text-white/40'}`} />
                  <div className="text-left">
                    <p className="text-white text-sm font-bold">Bank Transfer</p>
                    <p className="text-white/40 text-[10px]">Direct IPS/ConnectIPS transfer</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Action */}
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <LucideCreditCard className="w-5 h-5" />
                  Pay NPR 1,00,000 to Reserve
                </>
              )}
            </button>
            <p className="text-center text-white/30 text-[10px] mt-4">
              By clicking "Pay", you agree to our Reservation Terms & Conditions.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
