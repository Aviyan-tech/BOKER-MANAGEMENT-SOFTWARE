"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import {
  LucideMapPin, LucideGrid, LucideEye, LucideUser, LucideFileText,
  LucideCheck, LucideDownload, LucidePhone, LucideMail, LucideZap,
  LucideArrowRight, LucideShield, LucideRuler, LucideTag, LucideX,
  LucideChevronLeft, LucideChevronRight, LucideVideo, LucideMessageCircle,
  LucideCalendar, LucideMountain, LucideHome, LucideBuilding2, LucideTrees,
} from "lucide-react";

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  area: number;
  area_unit: string;
  price: number;
  land_type: string;
  status: string;
  agent_id: number;
  view_count: number;
  dimensions?: string;
  created_at: string;
  images: { id: number; url: string; is_cover: boolean }[];
  agent: { id: number; name: string; email: string; avatar_url?: string; phone_number?: string };
  certificates: { id: number; file_url: string; verified: boolean; created_at: string }[];
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken, fetchWithAuth } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inquiring, setInquiring] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "location" | "video">("details");

  const id = params?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_URL}/api/v1/listings/${id}`, { headers });
        if (!res.ok) throw new Error("Could not load listing details.");
        const data = await res.json();
        setListing(data);
        const coverIdx = data.images.findIndex((img: any) => img.is_cover);
        const idx = coverIdx >= 0 ? coverIdx : 0;
        setActiveImageIndex(idx);
        setActiveImage(data.images[idx]?.url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800");
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, accessToken]);

  const handleInquiry = async () => {
    if (!user) { router.push("/login"); return; }
    setInquiring(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: Number(id) }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit inquiry");
      }
      const deal = await res.json();
      router.push(`/dashboard/deals/${deal.id}`);
    } catch (err: any) {
      alert(err.message || "Error submitting inquiry");
    } finally {
      setInquiring(false);
    }
  };

  const navigateImage = (dir: "prev" | "next") => {
    if (!listing) return;
    const total = listing.images.length;
    const newIdx = dir === "next"
      ? (activeImageIndex + 1) % total
      : (activeImageIndex - 1 + total) % total;
    setActiveImageIndex(newIdx);
    setActiveImage(listing.images[newIdx].url);
  };

  const formatPrice = (paisa: number) => {
    const r = paisa / 100;
    if (r >= 10000000) return `NPR ${(r / 10000000).toFixed(2)} Crore`;
    if (r >= 100000) return `NPR ${(r / 100000).toFixed(2)} Lakh`;
    return `NPR ${r.toLocaleString()}`;
  };

  const formatPriceShort = (paisa: number) => {
    const r = paisa / 100;
    if (r >= 10000000) return `Rs.${(r / 10000000).toFixed(1)}Cr`;
    if (r >= 100000) return `Rs.${(r / 100000).toFixed(1)}L`;
    return `Rs.${r.toLocaleString()}`;
  };

  const getLandIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "residential": return <LucideHome className="h-5 w-5 text-blue-400" />;
      case "commercial":  return <LucideBuilding2 className="h-5 w-5 text-amber-400" />;
      case "agricultural": return <LucideTrees className="h-5 w-5 text-green-400" />;
      default: return <LucideMountain className="h-5 w-5 text-primary" />;
    }
  };

  const getLandBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "residential": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "commercial":  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "agricultural": return "bg-green-500/20 text-green-300 border-green-500/30";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading property details...</p>
        </div>
      </div>
    </div>
  );

  if (error || !listing) return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Could Not Load Listing</h2>
          <p className="text-muted-foreground text-sm mb-4">{error || "Listing not found"}</p>
          <button onClick={() => router.push("/")} className="bg-primary px-5 py-2.5 rounded-lg text-white font-semibold text-sm">
            ← Back to Browse
          </button>
        </div>
      </div>
    </div>
  );

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01},${listing.lat - 0.01},${listing.lng + 0.01},${listing.lat + 0.01}&layer=mapnik&marker=${listing.lat},${listing.lng}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && listing.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all" onClick={() => setLightboxOpen(false)}>
            <LucideX className="h-6 w-6" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all" onClick={(e) => { e.stopPropagation(); navigateImage("prev"); }}>
            <LucideChevronLeft className="h-6 w-6" />
          </button>
          <img src={activeImage} alt="Lightbox" className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all" onClick={(e) => { e.stopPropagation(); navigateImage("next"); }}>
            <LucideChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 text-white/60 text-sm">{activeImageIndex + 1} / {listing.images.length}</div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* ── HERO SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-auto lg:h-[520px]">
          {/* Main large image */}
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 cursor-pointer group h-64 lg:h-full"
            onClick={() => setLightboxOpen(true)}>
            <img src={activeImage} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide backdrop-blur-md ${getLandBadge(listing.land_type)}`}>
                {listing.land_type}
              </span>
              <span className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide backdrop-blur-md ${listing.status === "available" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                {listing.status}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="text-white font-black text-2xl leading-tight drop-shadow-lg">{formatPriceShort(listing.price)}</p>
                <p className="text-white/70 text-xs">{listing.area} {listing.area_unit} · {listing.location.split(",")[0]}</p>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 text-xs text-white">
                <LucideEye className="h-3.5 w-3.5 text-cyan-400" /> {listing.view_count} views
              </div>
            </div>
            {listing.images.length > 1 && (
              <>
                <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); navigateImage("prev"); }}>
                  <LucideChevronLeft className="h-5 w-5" />
                </button>
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); navigateImage("next"); }}>
                  <LucideChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {/* Thumbnail grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {listing.images.slice(0, 4).map((img, idx) => (
              <div key={img.id} className={`relative rounded-xl overflow-hidden bg-neutral-950 border cursor-pointer group h-28 lg:h-full transition-all ${activeImageIndex === idx ? "border-primary ring-2 ring-primary/40" : "border-white/10 hover:border-white/30"}`}
                onClick={() => { setActiveImageIndex(idx); setActiveImage(img.url); }}>
                <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {idx === 3 && listing.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center" onClick={() => setLightboxOpen(true)}>
                    <span className="text-white font-bold text-lg">+{listing.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
            {listing.images.length < 2 && (
              <div className="rounded-xl border border-white/5 bg-white/5 flex items-center justify-center h-28 lg:h-full">
                <p className="text-xs text-muted-foreground text-center px-2">No more photos</p>
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT CONTENT ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & Location */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  {getLandIcon(listing.land_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1.5">
                    <LucideMapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <LucideCalendar className="h-3.5 w-3.5" />
                    Listed {new Date(listing.created_at).toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Area", value: `${listing.area} ${listing.area_unit}`, icon: <LucideGrid className="h-5 w-5 text-primary" />, bg: "bg-primary/10 border-primary/20" },
                { label: "Land Type", value: listing.land_type, icon: getLandIcon(listing.land_type), bg: "bg-white/5 border-white/10" },
                ...(listing.dimensions ? [{ label: "Dimensions", value: listing.dimensions, icon: <LucideRuler className="h-5 w-5 text-cyan-400" />, bg: "bg-cyan-500/10 border-cyan-500/20" }] : []),
                { label: "Per " + listing.area_unit, value: formatPriceShort(Math.round(listing.price / listing.area)), icon: <LucideTag className="h-5 w-5 text-amber-400" />, bg: "bg-amber-500/10 border-amber-500/20" },
              ].map((stat, i) => (
                <div key={i} className={`glass-panel p-4 rounded-2xl border ${stat.bg} flex flex-col items-center text-center space-y-2`}>
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">{stat.icon}</div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</p>
                    <p className="text-sm font-bold text-white mt-0.5 capitalize">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs: Details / Location / Video */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex border-b border-white/10">
                {(["details", "location", "video"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
                    {tab === "details" && "📋 Details"}
                    {tab === "location" && "📍 Location"}
                    {tab === "video" && "🎥 Video Tour"}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">About This Land</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[
                        { label: "Land Type", value: listing.land_type },
                        { label: "Area", value: `${listing.area} ${listing.area_unit}` },
                        { label: "Status", value: listing.status },
                        { label: "Location", value: listing.location.split(",")[0] },
                        ...(listing.dimensions ? [{ label: "Dimensions", value: listing.dimensions }] : []),
                        { label: "Coordinates", value: `${listing.lat.toFixed(4)}, ${listing.lng.toFixed(4)}` },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.label}</p>
                          <p className="text-sm font-semibold text-white mt-0.5 capitalize">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "location" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white font-semibold">
                      <LucideMapPin className="h-4 w-4 text-primary" /> {listing.location}
                    </div>
                    <div className="rounded-xl overflow-hidden border border-white/10 h-64">
                      <iframe src={mapUrl} width="100%" height="100%" className="border-0" loading="lazy" title="Property Location" />
                    </div>
                    <p className="text-xs text-muted-foreground">GPS: {listing.lat.toFixed(6)}, {listing.lng.toFixed(6)}</p>
                  </div>
                )}
                {activeTab === "video" && (
                  <div className="space-y-4 text-center py-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                      <LucideVideo className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-white font-bold">Video Tour Not Available</h4>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">The agent hasn't uploaded a video tour yet. Start a negotiation to request a site visit or virtual walkthrough.</p>
                    <button onClick={handleInquiry} className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 transition-all">
                      <LucideMessageCircle className="h-4 w-4" /> Request Video Tour
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* How Negotiation Works */}
            <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <LucideZap className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-white">Live Negotiation — Like inDrive for Land</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: "1", title: "Inquire", desc: "Open a private deal room with the agent" },
                  { step: "2", title: "Make Offer", desc: "Propose your price — agent sees it live and counters instantly" },
                  { step: "3", title: "Deal Done!", desc: "Agree on price, documents shared, deal closed" },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm">{s.step}</div>
                    <p className="text-xs text-white font-bold">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">

            {/* Price + CTA */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 sticky top-20">
              <div className="text-center space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Asking Price</p>
                <p className="text-3xl font-black text-white">{formatPrice(listing.price)}</p>
                <p className="text-xs text-muted-foreground">{listing.area} {listing.area_unit} · {listing.location.split(",")[0]}</p>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-muted-foreground flex items-center gap-1"><LucideTag className="h-3.5 w-3.5" /> Per {listing.area_unit}</span>
                <span className="font-bold text-white">{formatPriceShort(Math.round(listing.price / listing.area))}</span>
              </div>

              {user?.id !== listing.agent_id ? (
                <button onClick={handleInquiry} disabled={inquiring || listing.status === "sold"}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all cursor-pointer text-sm">
                  {inquiring ? (
                    <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Opening Deal Room...</>
                  ) : listing.status === "sold" ? "This Land is Sold" : (
                    <><LucideZap className="h-4 w-4" /> Inquire & Negotiate Live <LucideArrowRight className="h-4 w-4 ml-auto" /></>
                  )}
                </button>
              ) : (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-semibold text-center">
                  You are the listing agent for this property.
                </div>
              )}

              {!user && (
                <p className="text-[11px] text-center text-muted-foreground">
                  <button onClick={() => router.push("/login")} className="text-primary underline underline-offset-2">Log in</button> to negotiate
                </p>
              )}
            </div>

            {/* Agent Card */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <LucideUser className="h-4 w-4 text-primary" /> Listing Agent
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={listing.agent.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${listing.agent.name}`}
                  alt={listing.agent.name}
                  className="h-14 w-14 rounded-full border-2 border-primary/30 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm">{listing.agent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{listing.agent.email}</p>
                  <span className="inline-block mt-1 text-[10px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">AGENT</span>
                </div>
              </div>

              <div className="space-y-2">
                {listing.agent.phone_number && (
                  <a href={`tel:${listing.agent.phone_number}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all group">
                    <div className="h-9 w-9 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <LucidePhone className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-green-400/70 font-bold uppercase tracking-wider">Call Agent</p>
                      <p className="text-sm font-bold text-green-300 group-hover:text-green-100 transition-colors">{listing.agent.phone_number}</p>
                    </div>
                  </a>
                )}

                <a href={`mailto:${listing.agent.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <LucideMail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Email Agent</p>
                    <p className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">{listing.agent.email}</p>
                  </div>
                </a>

                {user && user.id !== listing.agent_id && (
                  <button onClick={handleInquiry}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <LucideMessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Chat with Agent</p>
                      <p className="text-xs font-semibold text-primary">Open Deal Room Chat</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Security Badge */}
            <div className="glass-panel p-4 rounded-2xl border border-green-500/20 bg-green-500/5 flex items-center gap-3">
              <LucideShield className="h-8 w-8 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Secure & Verified</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">All negotiations are logged. Documents verified before sharing.</p>
              </div>
            </div>

            {/* Land Certificates */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <LucideFileText className="h-4 w-4 text-primary" /> Land Documents
              </h3>
              {listing.certificates.length === 0 ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lalpurja & ownership docs are shared after you open a deal room. Click "Inquire" to request access.
                </p>
              ) : (
                <div className="space-y-2">
                  {listing.certificates.map((cert) => (
                    <a key={cert.id} href={`${API_URL}${cert.file_url}`} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all text-xs text-white">
                      <span className="flex items-center gap-2">
                        <LucideFileText className="h-4 w-4 text-muted-foreground" />
                        Lalpurja #{cert.id}
                      </span>
                      {cert.verified
                        ? <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20"><LucideCheck className="h-3 w-3" /> Verified</span>
                        : <LucideDownload className="h-4 w-4 text-muted-foreground" />}
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
