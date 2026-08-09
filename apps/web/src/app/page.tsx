"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import HeroBanner from "../components/HeroBanner";
import { LucideCompass, LucideMapPin, LucideGrid } from "lucide-react";
import { motion } from "framer-motion";
import TopBrokersLeaderboard from "../components/TopBrokersLeaderboard";
import ClosedDealsSection from "../components/ClosedDealsSection";
import VerifiedBadge from "../components/VerifiedBadge";
import BrokerProBadge from "../components/BrokerProBadge";

interface Listing {
  id: number;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  area: number;
  area_unit: string;
  price: number; // in cents
  land_type: string;
  status: string;
  view_count: number;
  is_featured?: boolean;
  images: { id: number; url: string; is_cover: boolean }[];
  agent?: {
    id: number;
    name: string;
    is_verified?: boolean;
    is_pro?: boolean;
  };
}

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [landType, setLandType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchListings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("location", search);
      if (landType) queryParams.append("land_type", landType);
      if (priceMin) queryParams.append("price_min", String(Number(priceMin) * 100)); // dollars to cents
      if (priceMax) queryParams.append("price_max", String(Number(priceMax) * 100));

      const res = await fetch(`${API_URL}/api/v1/listings?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, landType, priceMin, priceMax]);

  const formatPrice = (paisa: number) => {
    const rupees = paisa / 100;
    if (rupees >= 10000000) return `Rs. ${(rupees / 10000000).toFixed(2)} Cr`;
    if (rupees >= 100000) return `Rs. ${(rupees / 100000).toFixed(2)} Lakh`;
    return `Rs. ${rupees.toLocaleString("en-NP")}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 z-20">
          <Navbar />
        </div>
        <HeroBanner
          search={search} setSearch={setSearch}
          landType={landType} setLandType={setLandType}
          priceMin={priceMin} setPriceMin={setPriceMin}
          priceMax={priceMax} setPriceMax={setPriceMax}
        />
      </div>

      {/* Main Browse Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideCompass className="h-5 w-5 text-primary" />
            Active Listings ({listings.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
            <p className="text-muted-foreground text-lg mb-2">No land parcels found matching your filters.</p>
            <p className="text-sm text-neutral-500">Try broadening your search criteria.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {listings.map((listing) => {
              const coverImg = listing.images.find((img) => img.is_cover)?.url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop";
              return (
                <motion.div
                  key={listing.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Link
                    href={`/listings/${listing.id}`}
                    className="group relative rounded-[2rem] overflow-hidden border border-white/5 flex flex-col h-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(168,85,247,0.25)] hover:border-purple-500/50 bg-gradient-to-br from-[#0c131c] to-[#050a10]"
                  >
                    {/* Inner glowing border on hover */}
                    <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_0_rgba(168,85,247,0)] group-hover:shadow-[inset_0_0_20px_rgba(168,85,247,0.15)] transition-shadow duration-500 pointer-events-none z-10" />

                    <div className="relative h-60 w-full overflow-hidden bg-neutral-950">
                      <img
                        src={coverImg}
                        alt={listing.title}
                        className="object-cover w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
                      />
                      {/* Stronger gradient overlay for badge readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
                      
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow-lg z-10">
                        {listing.land_type}
                      </div>
                      <div className="absolute top-4 right-4 bg-transparent backdrop-blur-md text-purple-300 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border-2 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.7)] z-10">
                        {listing.status}
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-between relative z-10">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 relative inline-block group-hover:text-purple-400 transition-colors duration-300 drop-shadow-md">
                          {listing.title}
                          <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all duration-400 group-hover:w-full"></span>
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-white/50 mb-6 font-medium tracking-wide">
                          <LucideMapPin className="h-3.5 w-3.5" />
                          <span className="line-clamp-1">{listing.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white/60">
                          <LucideGrid className="h-4 w-4 text-white/40" />
                          {listing.area} {listing.area_unit}
                        </div>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-200 drop-shadow-[0_4px_10px_rgba(168,85,247,0.4)] tracking-tight">
                          {formatPrice(listing.price)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Closed Deals Verified Record Showcase */}
        <ClosedDealsSection />

        {/* Top Deal Sold Brokers Leaderboard */}
        <TopBrokersLeaderboard />

      </main>
    </div>
  );
}
