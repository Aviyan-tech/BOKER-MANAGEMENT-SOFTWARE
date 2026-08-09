"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LucideSearch, LucideMapPin, LucideGrid, LucideClock, 
  LucideBadgeAlert, LucideCheckCircle2, LucideMessageCircle, 
  LucideXCircle, LucideFilter
} from "lucide-react";

type RequestStatus = "None" | "Pending" | "Accepted" | "Declined";
type LandType = "Residential" | "Commercial" | "Agricultural";

interface SellerListing {
  id: string;
  title: string;
  location: string;
  price: number; // raw value for filtering
  formattedPrice: string;
  area: number;
  areaUnit: string;
  landType: LandType;
  postedDate: string;
  requestStatus: RequestStatus;
}

const INITIAL_LISTINGS: SellerListing[] = [
  { id: "1", title: "Premium VIP Plot", location: "Budhanilkantha, Kathmandu", price: 35000000, formattedPrice: "3.5 Crore", area: 8, areaUnit: "Aana", landType: "Residential", postedDate: "2 days ago", requestStatus: "None" },
  { id: "2", title: "Fertile Farming Land", location: "Bharatpur, Chitwan", price: 8500000, formattedPrice: "85 Lakh", area: 1.5, areaUnit: "Bigha", landType: "Agricultural", postedDate: "5 days ago", requestStatus: "Pending" },
  { id: "3", title: "Highway Touch Commercial Space", location: "Milanchowk, Butwal", price: 120000000, formattedPrice: "12 Crore", area: 2, areaUnit: "Katha", landType: "Commercial", postedDate: "1 week ago", requestStatus: "None" },
  { id: "4", title: "Scenic Hillside Plot", location: "Kalika, Baglung", price: 3000000, formattedPrice: "30 Lakh", area: 2, areaUnit: "Ropani", landType: "Residential", postedDate: "3 days ago", requestStatus: "None" },
  { id: "5", title: "City Center Development Plot", location: "Traffic Chowk, Biratnagar", price: 65000000, formattedPrice: "6.5 Crore", area: 10, areaUnit: "Dhur", landType: "Commercial", postedDate: "2 weeks ago", requestStatus: "Declined" },
  { id: "6", title: "Peaceful Retreat Land", location: "Godawari, Lalitpur", price: 45000000, formattedPrice: "4.5 Crore", area: 1, areaUnit: "Ropani", landType: "Residential", postedDate: "1 day ago", requestStatus: "Accepted" }
];

const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case "None": return null;
    case "Pending": return <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"><LucideClock className="w-3 h-3" /> Request Pending</span>;
    case "Accepted": return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"><LucideCheckCircle2 className="w-3 h-3" /> Managing Property</span>;
    case "Declined": return <span className="flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"><LucideXCircle className="w-3 h-3" /> Offer Declined</span>;
  }
};

export default function FindSellersView() {
  const router = useRouter();
  const [listings, setListings] = useState<SellerListing[]>(INITIAL_LISTINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<LandType | "All">("All");

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("seller_listings_state");
    if (saved) {
      try {
        setListings(JSON.parse(saved));
      } catch (e) {
        // fallback to initial
      }
    }
  }, []);

  const saveListings = (newListings: SellerListing[]) => {
    setListings(newListings);
    localStorage.setItem("seller_listings_state", JSON.stringify(newListings));
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesSearch = l.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            l.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "All" || l.landType === filterType;
      return matchesSearch && matchesType;
    });
  }, [listings, searchQuery, filterType]);

  const handleOffer = (listing: SellerListing) => {
    const updated = listings.map(l => l.id === listing.id ? { ...l, requestStatus: "Pending" as RequestStatus } : l);
    saveListings(updated);
    
    // Initialize dummy chat
    const chatsStr = localStorage.getItem("seller_chats");
    const chats = chatsStr ? JSON.parse(chatsStr) : {};
    
    if (!chats[listing.id]) {
      chats[listing.id] = [
        {
          id: Date.now(),
          sender_id: "me", // marker for current broker
          content: `Hi, I'd like to represent your property: ${listing.title}. Let's discuss the terms.`,
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem("seller_chats", JSON.stringify(chats));
    }

    router.push(`/dashboard/chats?sellerId=${listing.id}`);
  };

  const handleContinueChat = (listing: SellerListing) => {
    router.push(`/dashboard/chats?sellerId=${listing.id}`);
  };

  return (
    <div className="relative animate-fade-in z-10 w-full mt-4">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-md">
            Find Sellers
          </h2>
          <p className="text-white/50 text-xs font-medium mt-1">
            Browse unrepresented properties and offer your brokerage services to owners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a111a] border border-white/10 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <h3 className="font-bold text-xs text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <LucideFilter className="w-3.5 h-3.5" /> Discovery Filters
            </h3>
            
            <div className="mb-4 relative">
              <LucideSearch className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search location or title..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Property Type</label>
              <div className="space-y-1">
                {(["All", "Residential", "Commercial", "Agricultural"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as LandType | "All")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-between ${
                      filterType === type 
                        ? "bg-white/10 text-white border border-white/20 shadow-md" 
                        : "text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent"
                    }`}
                  >
                    {type}
                    {filterType === type && <LucideCheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#0a111a] border border-orange-500/20 rounded-3xl p-6 shadow-[0_10px_40px_rgba(249,115,22,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
            <LucideBadgeAlert className="w-8 h-8 text-orange-400 mb-3" />
            <h4 className="font-bold text-white text-sm mb-2">Grow Your Pipeline</h4>
            <p className="text-white/60 text-xs">
              Sellers list properties here without agents. Send them an offer to represent them. If they accept, the property moves directly to your "Manage Listings" pipeline!
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="text-lg font-black text-white drop-shadow-md">
              Available Unrepresented Properties
            </h2>
            <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-500/20">
              {filteredListings.length} {filteredListings.length === 1 ? 'Match' : 'Matches'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filteredListings.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#0a111a] border border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <LucideSearch className="w-6 h-6 text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No properties found</h3>
                <p className="text-white/50 text-xs max-w-sm">
                  Try adjusting your filters to find more properties.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial="hidden" animate="show" exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                {filteredListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className={`group bg-[#0a111a] border rounded-[1.5rem] p-5 md:p-6 transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${
                      listing.requestStatus === "Accepted" 
                        ? "border-emerald-500/30 opacity-70"
                        : "border-white/10 hover:shadow-[0_15px_40px_rgba(249,115,22,0.15)] hover:border-orange-500/30"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 min-w-0 z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="bg-white/10 text-white/80 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
                            {listing.landType}
                          </span>
                          <span className="bg-red-500/10 text-red-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                            <LucideBadgeAlert className="w-3 h-3" /> No Agent Assigned
                          </span>
                          {getStatusBadge(listing.requestStatus)}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-orange-300 transition-colors">
                          {listing.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/60">
                          <div className="flex items-center gap-1.5">
                            <LucideMapPin className="w-4 h-4 text-white/40" />
                            {listing.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LucideGrid className="w-4 h-4 text-white/40" />
                            {listing.area} {listing.areaUnit}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LucideClock className="w-4 h-4 text-white/40" />
                            Posted {listing.postedDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end z-10">
                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-orange-200 drop-shadow-md mb-3">
                          {listing.formattedPrice}
                        </div>
                        
                        {listing.requestStatus === "None" && (
                          <button 
                            onClick={() => handleOffer(listing)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center gap-2 w-full md:w-auto justify-center"
                          >
                            <LucideMessageCircle className="w-3.5 h-3.5" />
                            Offer to Represent
                          </button>
                        )}
                        {listing.requestStatus === "Pending" && (
                          <button 
                            onClick={() => handleContinueChat(listing)}
                            className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/10 w-full md:w-auto justify-center flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <LucideMessageCircle className="w-3.5 h-3.5" />
                            Negotiating (Chat)
                          </button>
                        )}
                        {listing.requestStatus === "Accepted" && (
                          <button 
                            onClick={() => handleContinueChat(listing)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-500/30 w-full md:w-auto justify-center flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <LucideCheckCircle2 className="w-3.5 h-3.5" /> Manage in Pipeline
                          </button>
                        )}
                        {listing.requestStatus === "Declined" && (
                          <button disabled className="bg-white/5 text-red-400/50 text-xs font-bold px-4 py-2 rounded-xl border border-white/10 w-full md:w-auto justify-center flex cursor-not-allowed">
                            Offer Declined
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
