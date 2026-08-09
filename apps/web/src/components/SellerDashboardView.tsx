"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LucideMapPin, LucideRuler, LucideTag, LucideBanknote,
  LucideUpload, LucideFileText, LucideImage, LucideVideo,
  LucideUser, LucidePhone, LucideMail, LucideMessageSquare,
  LucideDownload, LucideCheckCircle2, LucideTag as LucideDiscount,
  LucideAlertCircle, LucideLoader2, LucideX, LucideBadgeCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type LandType = "residential" | "agricultural" | "commercial";
type AreaUnit = "Aana" | "Ropani" | "Bigha" | "Katha" | "Dhur" | "sqft";

interface PropertyForm {
  title: string;
  location: string;
  area: string;
  areaUnit: AreaUnit;
  landType: LandType;
  price: string;
  description: string;
  dimensions: string;
}

const DUMMY_BROKER = {
  name: "Rajesh Maharjan",
  photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=RajeshMaharjan",
  phone: "+977-9841234567",
  email: "rajesh.maharjan@vishwasghar.com.np",
  is_verified: true,
  rating: 4.9,
  specialty: "Residential & Commercial land brokerage, Kathmandu Valley specialist",
};

const DUMMY_AGREEMENT = {
  title: "Land Listing Agreement",
  date: "2025-07-15",
  propertyTitle: "Your listed property",
  agentName: DUMMY_BROKER.name,
  status: "Pending Seller Signature",
};

export default function SellerDashboardView() {
  const { user } = useAuth();

  // Property form state
  const [form, setForm] = useState<PropertyForm>({
    title: "",
    location: "",
    area: "",
    areaUnit: "Aana",
    landType: "residential",
    price: "",
    description: "",
    dimensions: "",
  });
  const [formSaved, setFormSaved] = useState(false);
  const [formSaving, setFormSaving] = useState(false);

  // Upload states
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<"doc" | "photo" | "video" | null>(null);

  const docRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (field: keyof PropertyForm, value: string) => {
    setFormSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    // Simulate API save
    await new Promise((r) => setTimeout(r, 900));
    setFormSaving(false);
    setFormSaved(true);
  };

  const handleFileSelect = (
    type: "doc" | "photo" | "video",
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    if (type === "doc") setDocFiles((p) => [...p, ...arr]);
    else if (type === "photo") setPhotoFiles((p) => [...p, ...arr]);
    else setVideoFiles((p) => [...p, ...arr]);
  };

  const removeFile = (type: "doc" | "photo" | "video", idx: number) => {
    if (type === "doc") setDocFiles((p) => p.filter((_, i) => i !== idx));
    else if (type === "photo") setPhotoFiles((p) => p.filter((_, i) => i !== idx));
    else setVideoFiles((p) => p.filter((_, i) => i !== idx));
  };

  const simulateUpload = async (type: "doc" | "photo" | "video") => {
    setUploading(type);
    await new Promise((r) => setTimeout(r, 1200));
    setUploading(null);
  };

  return (
    <div className="relative animate-fade-in space-y-8">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[140px] rounded-full pointer-events-none mix-blend-screen" />

      {/* ── Listing Fee Banner ── */}
      <div className="glass-panel rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-background to-background p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <LucideDiscount className="w-3.5 h-3.5" /> Limited Time Offer
          </p>
          <h3 className="text-white font-extrabold text-base">One-Time Listing Fee</h3>
          <p className="text-xs text-white/50">Pay once — your property stays listed until sold.</p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-white/35 text-lg font-bold line-through decoration-red-400">Rs. 599</span>
          <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">Rs. 299</span>
          <span className="text-xs text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">50% OFF</span>
        </div>
      </div>

      {/* ── Property Details Form ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-5">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <LucideMapPin className="w-4 h-4 text-emerald-400" /> Property Details
        </h2>

        <form onSubmit={handleSaveProperty} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Property Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              placeholder="e.g. Prime Residential Plot in Budhanilkantha"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/25"
            />
          </div>

          {/* Location + Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                <LucideMapPin className="w-3 h-3 inline mr-1" />Location
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => handleFormChange("location", e.target.value)}
                placeholder="e.g. Budhanilkantha, Kathmandu"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                Dimensions (optional)
              </label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => handleFormChange("dimensions", e.target.value)}
                placeholder="e.g. 60ft × 40ft"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Area + Unit + Land Type */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                <LucideRuler className="w-3 h-3 inline mr-1" />Area
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.area}
                onChange={(e) => handleFormChange("area", e.target.value)}
                placeholder="e.g. 8"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Unit</label>
              <select
                value={form.areaUnit}
                onChange={(e) => handleFormChange("areaUnit", e.target.value)}
                className="w-full bg-[#0a111a] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              >
                {(["Aana", "Ropani", "Bigha", "Katha", "Dhur", "sqft"] as AreaUnit[]).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                <LucideTag className="w-3 h-3 inline mr-1" />Land Type
              </label>
              <select
                value={form.landType}
                onChange={(e) => handleFormChange("landType", e.target.value as LandType)}
                className="w-full bg-[#0a111a] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              >
                <option value="residential">Residential</option>
                <option value="agricultural">Agricultural</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
              <LucideBanknote className="w-3 h-3 inline mr-1" />Asking Price (NPR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold">Rs.</span>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => handleFormChange("price", e.target.value)}
                placeholder="e.g. 35000000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-8 pr-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="Describe the property — road access, water supply, nearby landmarks, etc."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/25 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={formSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-60"
          >
            {formSaving ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : formSaved ? <LucideCheckCircle2 className="w-4 h-4" /> : <LucideMapPin className="w-4 h-4" />}
            {formSaving ? "Saving…" : formSaved ? "Details Saved!" : "Save Property Details"}
          </button>
        </form>
      </div>

      {/* ── Document Upload ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <LucideFileText className="w-4 h-4 text-sky-400" /> Ownership Documents
        </h2>
        <p className="text-xs text-white/50">Upload lal-purja, ownership certificate, or any land-related paperwork (PDF/JPG accepted).</p>

        <div
          onClick={() => docRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-sky-500/40 hover:bg-sky-500/5 transition-all group"
        >
          <LucideUpload className="w-6 h-6 text-white/20 group-hover:text-sky-400 mx-auto mb-2 transition-colors" />
          <p className="text-xs text-white/40 group-hover:text-white/60">Click to select documents</p>
          <input ref={docRef} type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileSelect("doc", e.target.files)} />
        </div>

        {docFiles.length > 0 && (
          <div className="space-y-2">
            {docFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs">
                <span className="text-white/70 truncate max-w-[70%]">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/30">{(f.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => removeFile("doc", i)} className="text-white/30 hover:text-red-400 transition-colors">
                    <LucideX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => simulateUpload("doc")} disabled={uploading === "doc"}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all disabled:opacity-60">
              {uploading === "doc" ? <LucideLoader2 className="w-3.5 h-3.5 animate-spin" /> : <LucideUpload className="w-3.5 h-3.5" />}
              {uploading === "doc" ? "Uploading…" : "Upload Documents"}
            </button>
          </div>
        )}
      </div>

      {/* ── Photo & Video Upload ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <LucideImage className="w-4 h-4 text-violet-400" /> Property Photos & Videos
        </h2>
        <p className="text-xs text-white/50">High-quality photos and walkthrough videos increase buyer interest significantly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photos */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <LucideImage className="w-3.5 h-3.5 text-violet-400" /> Photos
            </p>
            <div onClick={() => photoRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group">
              <LucideImage className="w-5 h-5 text-white/20 group-hover:text-violet-400 mx-auto mb-1.5 transition-colors" />
              <p className="text-xs text-white/40">JPG / PNG / WEBP</p>
              <input ref={photoRef} type="file" className="hidden" multiple accept="image/*"
                onChange={(e) => handleFileSelect("photo", e.target.files)} />
            </div>
            {photoFiles.length > 0 && (
              <div className="space-y-1.5">
                {photoFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-white/60 truncate max-w-[65%]">{f.name}</span>
                    <button onClick={() => removeFile("photo", i)} className="text-white/30 hover:text-red-400 transition-colors">
                      <LucideX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => simulateUpload("photo")} disabled={uploading === "photo"}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all disabled:opacity-60">
                  {uploading === "photo" ? <LucideLoader2 className="w-3 h-3 animate-spin" /> : <LucideUpload className="w-3 h-3" />}
                  {uploading === "photo" ? "Uploading…" : `Upload ${photoFiles.length} Photo${photoFiles.length > 1 ? "s" : ""}`}
                </button>
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <LucideVideo className="w-3.5 h-3.5 text-rose-400" /> Videos
            </p>
            <div onClick={() => videoRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-rose-500/40 hover:bg-rose-500/5 transition-all group">
              <LucideVideo className="w-5 h-5 text-white/20 group-hover:text-rose-400 mx-auto mb-1.5 transition-colors" />
              <p className="text-xs text-white/40">MP4 / MOV / AVI</p>
              <input ref={videoRef} type="file" className="hidden" multiple accept="video/*"
                onChange={(e) => handleFileSelect("video", e.target.files)} />
            </div>
            {videoFiles.length > 0 && (
              <div className="space-y-1.5">
                {videoFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-white/60 truncate max-w-[65%]">{f.name}</span>
                    <button onClick={() => removeFile("video", i)} className="text-white/30 hover:text-red-400 transition-colors">
                      <LucideX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => simulateUpload("video")} disabled={uploading === "video"}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all disabled:opacity-60">
                  {uploading === "video" ? <LucideLoader2 className="w-3 h-3 animate-spin" /> : <LucideUpload className="w-3 h-3" />}
                  {uploading === "video" ? "Uploading…" : `Upload ${videoFiles.length} Video${videoFiles.length > 1 ? "s" : ""}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Assigned Broker Card ── */}
      <div className="glass-panel rounded-2xl border border-amber-500/20 p-6 space-y-4 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <LucideUser className="w-4 h-4 text-amber-400" /> Your Assigned Broker
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={DUMMY_BROKER.photo}
              alt={DUMMY_BROKER.name}
              className="w-16 h-16 rounded-2xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            />
            {DUMMY_BROKER.is_verified && (
              <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <LucideBadgeCheck className="w-3.5 h-3.5 text-white" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-extrabold text-sm">{DUMMY_BROKER.name}</p>
              {DUMMY_BROKER.is_verified && (
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Verified Agent
                </span>
              )}
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                ★ {DUMMY_BROKER.rating}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">{DUMMY_BROKER.specialty}</p>

            <div className="flex flex-wrap gap-4 mt-3">
              <a href={`tel:${DUMMY_BROKER.phone}`}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors group">
                <LucidePhone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="group-hover:underline underline-offset-2">{DUMMY_BROKER.phone}</span>
              </a>
              <a href={`mailto:${DUMMY_BROKER.email}`}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors group">
                <LucideMail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="group-hover:underline underline-offset-2">{DUMMY_BROKER.email}</span>
              </a>
            </div>
          </div>

          <a
            href={`mailto:${DUMMY_BROKER.email}?subject=Property inquiry from ${user?.name || "Seller"}`}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] flex-shrink-0"
          >
            <LucideMessageSquare className="w-3.5 h-3.5" /> Contact Broker
          </a>
        </div>
      </div>

      {/* ── Sales Agreement ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <LucideFileText className="w-4 h-4 text-sky-400" /> Sales Agreement
        </h2>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-white font-bold text-sm">{DUMMY_AGREEMENT.title}</p>
            <p className="text-xs text-white/50">
              Between <span className="text-white/70 font-semibold">{user?.name || "You"}</span> and <span className="text-white/70 font-semibold">{DUMMY_AGREEMENT.agentName}</span>
            </p>
            <p className="text-xs text-white/40">Dated: {DUMMY_AGREEMENT.date}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wide">
              <LucideAlertCircle className="w-3 h-3" /> {DUMMY_AGREEMENT.status}
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-all shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            >
              <LucideDownload className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-xs text-white/50 leading-relaxed font-serif space-y-2">
          <p className="font-sans text-[10px] uppercase font-bold text-white/30 tracking-wider">Agreement Preview</p>
          <p>This Listing Agreement is entered into between <strong className="text-white/70">{user?.name || "the Seller"}</strong> (hereinafter "Owner") and <strong className="text-white/70">{DUMMY_AGREEMENT.agentName}</strong> (hereinafter "Broker") of VishwasGhar Platform.</p>
          <p>The Owner grants the Broker exclusive authority to market, list, and facilitate the sale of the property described in Section 1 of this agreement, in accordance with the terms agreed upon the VishwasGhar land broker management platform.</p>
          <p className="text-white/30 italic">— Full document available after broker review and countersignature.</p>
        </div>
      </div>

    </div>
  );
}
