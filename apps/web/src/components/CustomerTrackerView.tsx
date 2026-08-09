"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LucideUsers, LucideEye, LucideHeart, LucideMessageSquare, 
  LucideFilter, LucideSearch, LucideCheckCircle2, LucidePhoneCall, 
  LucideMail, LucideClock, LucideMapPin, LucideX
} from "lucide-react";

type LeadStatus = "New" | "Contacted" | "Converted";
type LeadSource = "Call Request" | "Chat" | "Inquiry Form";

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  property: string;
  source: LeadSource;
  status: LeadStatus;
  dateStr: string;
}

interface ListingStat {
  id: string;
  title: string;
  views: number;
  saves: number;
  inquiries: number;
}

const generateDummyLeads = (): Lead[] => {
  return [
    { id: "1", name: "Anil Gurung", phone: "+977 9841234567", email: "anil.g@example.com", message: "Interested in the Lakeside property. When can we visit?", property: "Lakeside Villa Plot", source: "Inquiry Form", status: "New", dateStr: "2026-07-20" },
    { id: "2", name: "Sita Sharma", phone: "+977 9809876543", message: "Please call me regarding the commercial land.", property: "Amarsingh Chowk Commercial", source: "Call Request", status: "Contacted", dateStr: "2026-07-19" },
    { id: "3", name: "Ramesh Thapa", email: "ramesh.t@gmail.com", message: "Is the price negotiable?", property: "Hemja Residential", source: "Chat", status: "Converted", dateStr: "2026-07-18" },
    { id: "4", name: "Pooja Karki", phone: "+977 9811122334", email: "pooja.karki@yahoo.com", message: "Looking for 4 aana land in this area.", property: "Lakeside Villa Plot", source: "Inquiry Form", status: "New", dateStr: "2026-07-20" },
  ];
};

const DUMMY_LEADS = generateDummyLeads();
const DUMMY_STATS: ListingStat[] = [
  { id: "101", title: "Lakeside Villa Plot", views: 1205, saves: 48, inquiries: 12 },
  { id: "102", title: "Amarsingh Chowk Commercial", views: 890, saves: 32, inquiries: 5 },
  { id: "103", title: "Hemja Residential", views: 450, saves: 15, inquiries: 3 },
];

const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case "New": return "text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]";
    case "Contacted": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "Converted": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  }
};

const getSourceIcon = (source: LeadSource) => {
  switch (source) {
    case "Call Request": return <LucidePhoneCall className="w-3.5 h-3.5 text-blue-400" />;
    case "Chat": return <LucideMessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
    case "Inquiry Form": return <LucideMail className="w-3.5 h-3.5 text-purple-400" />;
  }
};

export default function CustomerTrackerView() {
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "All">("All");
  const [filterProperty, setFilterProperty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return DUMMY_LEADS.filter(lead => {
      const matchesStatus = filterStatus === "All" || lead.status === filterStatus;
      const matchesProperty = filterProperty === "All" || lead.property === filterProperty;
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lead.property.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesProperty && matchesSearch;
    });
  }, [filterStatus, filterProperty, searchQuery]);

  return (
    <div className="relative animate-fade-in z-10 w-full mt-4">
      {/* Background ambient glow inside dashboard content area */}
      <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-md flex items-center gap-2">
            Customer Tracker
          </h2>
          <p className="text-white/50 text-xs font-medium mt-1">
            Manage your leads based on active form submissions and contact requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Sidebar: Stats & Filters */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Global Listing Stats */}
          <div className="bg-[#0a111a] border border-white/10 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <h3 className="font-bold text-xs text-white/60 uppercase tracking-wider mb-4">
              Property Engagement
            </h3>
            <div className="space-y-4">
              {DUMMY_STATS.map(stat => (
                <div key={stat.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <h4 className="text-sm font-bold text-white mb-2 truncate">{stat.title}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <LucideEye className="w-3.5 h-3.5 text-white/40 mx-auto mb-1" />
                      <span className="block text-xs font-black text-white">{stat.views}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <LucideHeart className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
                      <span className="block text-xs font-black text-white">{stat.saves}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <LucideMessageSquare className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                      <span className="block text-xs font-black text-white">{stat.inquiries}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-white/30 mt-4 text-center">
              Stats represent anonymous platform engagement. No PII is captured until a user explicitly submits a form.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-[#0a111a] border border-white/10 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <h3 className="font-bold text-xs text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <LucideFilter className="w-3.5 h-3.5" /> Filters
            </h3>
            
            <div className="mb-4 relative">
              <LucideSearch className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Status</label>
                <div className="space-y-1">
                  {(["All", "New", "Contacted", "Converted"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status as LeadStatus | "All")}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-between ${
                        filterStatus === status 
                          ? "bg-white/10 text-white border border-white/20 shadow-md" 
                          : "text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent"
                      }`}
                    >
                      {status}
                      {filterStatus === status && <LucideCheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 block mt-2">Property</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none"
                  value={filterProperty}
                  onChange={(e) => setFilterProperty(e.target.value)}
                >
                  <option value="All" className="bg-[#0a111a]">All Properties</option>
                  {DUMMY_STATS.map(s => <option key={s.id} value={s.title} className="bg-[#0a111a]">{s.title}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lead List */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="text-lg font-black text-white drop-shadow-md flex items-center gap-2">
              <LucideUsers className="w-5 h-5 text-purple-400" />
              Active Leads
            </h2>
            <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-500/20">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'Lead' : 'Leads'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filteredLeads.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#0a111a] border border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <LucideUsers className="w-6 h-6 text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No leads found</h3>
                <p className="text-white/50 text-xs max-w-sm">
                  Try adjusting your filters or wait for new property inquiries to come in.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3"
                initial="hidden" animate="show" exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                {filteredLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0 }
                    }}
                    onClick={() => setSelectedLead(lead)}
                    className="group bg-[#0a111a] border border-white/10 rounded-[1.5rem] p-4 flex flex-col md:flex-row gap-4 items-start md:items-center transition-all duration-300 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] hover:border-purple-500/30 hover:-translate-y-1 cursor-pointer overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {lead.name}
                        </h3>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-white/50 mb-2">
                        <span className="flex items-center gap-1 bg-white/5 text-white/70 px-2 py-0.5 rounded-md border border-white/10">
                          {getSourceIcon(lead.source)}
                          {lead.source}
                        </span>
                        <div className="flex items-center gap-1">
                          <LucideMapPin className="w-3 h-3 text-white/40" />
                          <span className="truncate max-w-[200px]">{lead.property}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <LucideClock className="w-3 h-3 text-white/40" />
                          <span>{lead.dateStr}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-white/60 line-clamp-1 italic border-l-2 border-white/10 pl-2">
                        "{lead.message}"
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a111a] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10"
            >
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <LucideX className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <LucideUsers className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                    <span className="text-[10px] text-white/40">{selectedLead.dateStr}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Contact Details</h4>
                  <div className="space-y-2">
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2 text-sm text-white">
                        <LucidePhoneCall className="w-4 h-4 text-white/50" />
                        <a href={`tel:${selectedLead.phone}`} className="hover:text-purple-300 transition-colors">{selectedLead.phone}</a>
                      </div>
                    )}
                    {selectedLead.email && (
                      <div className="flex items-center gap-2 text-sm text-white">
                        <LucideMail className="w-4 h-4 text-white/50" />
                        <a href={`mailto:${selectedLead.email}`} className="hover:text-purple-300 transition-colors">{selectedLead.email}</a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Inquiry Details</h4>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <LucideMapPin className="w-4 h-4 text-white/50" />
                      <span className="font-semibold">{selectedLead.property}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white">
                      {getSourceIcon(selectedLead.source)}
                      <span className="text-white/80">Source: {selectedLead.source}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-sm text-white/80 italic">
                    "{selectedLead.message}"
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  Contact Lead
                </button>
                <button className="flex-1 bg-white/10 hover:bg-white/15 text-white text-sm font-bold py-3 rounded-xl border border-white/10 transition-colors">
                  Update Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
