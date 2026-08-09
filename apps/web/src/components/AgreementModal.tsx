"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideX, LucideFileText, LucideCheck, LucideDownload, LucidePenTool, LucideShieldCheck, LucidePrinter } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: number;
  onSuccess?: () => void;
}

interface AgreementData {
  deal_id: number;
  property_title: string;
  property_location: string;
  property_area: string;
  deal_type: string;
  asking_price: number;
  final_price: number;
  buyer_name: string;
  seller_name: string;
  agent_name: string;
  agent_is_verified: boolean;
  buyer_signature?: string;
  agent_signature?: string;
  seller_signature?: string;
  agreement_signed_at?: string;
  stage: string;
}

export default function AgreementModal({ isOpen, onClose, dealId, onSuccess }: AgreementModalProps) {
  const { user, fetchWithAuth } = useAuth();
  const [agreement, setAgreement] = useState<AgreementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("type");
  const [typedSignature, setTypedSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  // Canvas ref for drawing signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchAgreement = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/brokers/deals/${dealId}/agreement`);
      if (res.ok) {
        const data = await res.json();
        setAgreement(data);
        if (user) {
          setTypedSignature(user.name);
        }
      }
    } catch (err) {
      console.error("Agreement fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && dealId) {
      fetchAgreement();
    }
  }, [isOpen, dealId]);

  // Canvas drawing helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSign = async () => {
    if (!user || !agreement) return;

    let sigData = "";
    if (signatureMode === "draw" && canvasRef.current) {
      sigData = canvasRef.current.toDataURL();
    } else {
      sigData = `Digital Signature: ${typedSignature} [Verified ID: ${user.id}]`;
    }

    if (!sigData) {
      alert("Please provide a digital signature before submitting.");
      return;
    }

    setIsSigning(true);
    try {
      const signerRole = user.role === "AGENT" ? "AGENT" : "BUYER";
      const res = await fetchWithAuth(`${API_URL}/api/v1/brokers/deals/${dealId}/agreement/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature_data: sigData,
          signer_role: signerRole,
          buyer_name: agreement.buyer_name,
          seller_name: agreement.seller_name,
          final_price: agreement.final_price
        })
      });

      if (res.ok) {
        await fetchAgreement();
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to sign agreement");
      }
    } catch (err) {
      console.error("Signing error:", err);
    } finally {
      setIsSigning(false);
    }
  };

  const handlePrintDownload = () => {
    window.print();
  };

  const formatPrice = (paisa: number) => {
    const r = paisa / 100;
    if (r >= 10000000) return `NPR ${(r / 10000000).toFixed(2)} Crore`;
    if (r >= 100000) return `NPR ${(r / 100000).toFixed(2)} Lakh`;
    return `NPR ${r.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#090f17] border border-white/15 rounded-[2.5rem] p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-white my-8 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors print:hidden"
          >
            <LucideX className="w-5 h-5" />
          </button>

          {loading || !agreement ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/60 text-sm">Generating legal agreement contract...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Printable Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <LucideFileText className="w-6 h-6 text-sky-400" />
                    <h2 className="text-2xl font-black text-white">
                      Legal {agreement.deal_type === "RENTAL" ? "Rental / Lease" : "Land Purchase"} Agreement
                    </h2>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Official platform contract • Deal Room ID #{agreement.deal_id}
                  </p>
                </div>

                <div className="flex items-center gap-3 print:hidden">
                  <button
                    onClick={handlePrintDownload}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors"
                  >
                    <LucidePrinter className="w-4 h-4 text-sky-400" /> Print / Download PDF
                  </button>
                </div>
              </div>

              {/* Legal Document Body */}
              <div id="printable-contract" className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 text-sm text-white/80 leading-relaxed font-serif">
                
                <div className="text-center space-y-1 font-sans border-b border-white/10 pb-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    {agreement.deal_type === "RENTAL" ? "LAND LEASE & TENANCY AGREEMENT" : "REAL ESTATE DEED OF SALE AGREEMENT"}
                  </h3>
                  <p className="text-xs text-sky-400 font-semibold">Nepal Land Broker Management Platform</p>
                </div>

                <p>
                  This agreement is executed on <strong className="text-white">{new Date().toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })}</strong> between the undersigned Parties:
                </p>

                {/* Parties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs bg-black/40 p-4 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Purchaser / Tenant</span>
                    <strong className="text-white text-sm block mt-0.5">{agreement.buyer_name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Seller / Landlord</span>
                    <strong className="text-white text-sm block mt-0.5">{agreement.seller_name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Verified Listing Agent</span>
                    <strong className="text-sky-300 text-sm block mt-0.5">{agreement.agent_name}</strong>
                  </div>
                </div>

                {/* Property & Price Terms */}
                <div className="space-y-2 font-sans">
                  <h4 className="font-bold text-white uppercase tracking-wide text-xs text-sky-400">Property & Financial Terms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] block">Property Title</span>
                      <strong className="text-white block mt-0.5">{agreement.property_title}</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] block">Location</span>
                      <strong className="text-white block mt-0.5">{agreement.property_location}</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] block">Total Land Area</span>
                      <strong className="text-white block mt-0.5">{agreement.property_area}</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] block">Agreed Transaction Price</span>
                      <strong className="text-emerald-400 font-bold block mt-0.5 text-sm">{formatPrice(agreement.final_price)}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <p>
                    1. <strong>Ownership & Title:</strong> The Seller affirms that they possess clear, unencumbered title to the property with all municipal tax clearances up to date.
                  </p>
                  <p>
                    2. <strong>Payment & Closing:</strong> The Buyer agrees to complete full financial settlement via bank transfer or escrow within the stipulated timeframe.
                  </p>
                  <p>
                    3. <strong>Digital Signatures:</strong> Both parties agree that digital signatures affixed below constitute legally binding signatures under Applicable Electronic Commerce Laws.
                  </p>
                </div>

                {/* Digital Signatures Box */}
                <div className="pt-6 border-t border-white/10 font-sans">
                  <h4 className="font-bold text-white uppercase tracking-wide text-xs mb-4 text-sky-400 flex items-center gap-1.5">
                    <LucideShieldCheck className="w-4 h-4 text-emerald-400" /> Executed Digital Signatures
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Buyer Signature Box */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center space-y-2">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Buyer Signature</span>
                      {agreement.buyer_signature ? (
                        <div className="py-3 px-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 font-mono text-xs">
                          {agreement.buyer_signature.startsWith("data:image") ? (
                            <img src={agreement.buyer_signature} alt="Buyer Signature" className="h-12 mx-auto object-contain" />
                          ) : (
                            <span>✓ {agreement.buyer_signature}</span>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 bg-white/5 border border-dashed border-white/20 rounded-lg text-white/40 text-xs italic">
                          Awaiting Buyer Signature
                        </div>
                      )}
                      <span className="text-[10px] text-white/50 block">{agreement.buyer_name}</span>
                    </div>

                    {/* Agent Signature Box */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center space-y-2">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Agent Signature</span>
                      {agreement.agent_signature ? (
                        <div className="py-3 px-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 font-mono text-xs">
                          {agreement.agent_signature.startsWith("data:image") ? (
                            <img src={agreement.agent_signature} alt="Agent Signature" className="h-12 mx-auto object-contain" />
                          ) : (
                            <span>✓ {agreement.agent_signature}</span>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 bg-white/5 border border-dashed border-white/20 rounded-lg text-white/40 text-xs italic">
                          Awaiting Agent Signature
                        </div>
                      )}
                      <span className="text-[10px] text-white/50 block">{agreement.agent_name}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Signature Interaction Panel */}
              {user && (
                <div className="p-6 bg-slate-900/90 border border-sky-500/30 rounded-2xl space-y-4 print:hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <LucidePenTool className="w-4 h-4 text-sky-400" /> Sign Agreement as {user.name} ({user.role})
                    </h3>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => setSignatureMode("type")}
                        className={`px-3 py-1 rounded-lg transition-colors ${signatureMode === 'type' ? 'bg-sky-500 text-white font-bold' : 'bg-white/5 text-white/60 hover:text-white'}`}
                      >
                        Type Signature
                      </button>
                      <button
                        onClick={() => setSignatureMode("draw")}
                        className={`px-3 py-1 rounded-lg transition-colors ${signatureMode === 'draw' ? 'bg-sky-500 text-white font-bold' : 'bg-white/5 text-white/60 hover:text-white'}`}
                      >
                        Draw Signature
                      </button>
                    </div>
                  </div>

                  {signatureMode === "type" ? (
                    <div>
                      <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Type Full Legal Name</label>
                      <input
                        type="text"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Draw Signature Below</label>
                        <button onClick={clearCanvas} className="text-[10px] text-sky-400 hover:underline">Clear Canvas</button>
                      </div>
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full bg-black/60 border border-white/20 rounded-xl cursor-crosshair touch-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSign}
                    disabled={isSigning}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSigning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Affixing Digital Signature...
                      </>
                    ) : (
                      <>
                        <LucideCheck className="w-5 h-5" /> Affix Digital Signature & Complete Agreement
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
