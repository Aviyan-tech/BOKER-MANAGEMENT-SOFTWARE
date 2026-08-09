"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LucideBanknote,
  LucideShieldCheck,
  LucideRuler,
  LucideScale,
  LucidePhone,
  LucideMail,
  LucideUser,
  LucideInfo,
} from "lucide-react";

type Category = "All" | "Loan" | "Insurance" | "Surveyor" | "Lawyer";

interface Professional {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  phone: string;
  email: string;
  specialty: string;
}

const PROFESSIONALS: Professional[] = [
  // Loan
  {
    id: "l1",
    name: "Ramesh Acharya",
    category: "Loan",
    phone: "+977-9841234567",
    email: "ramesh.acharya@nabilbank.com.np",
    specialty: "Home loan & agricultural land financing specialist with 12 years at Nabil Bank.",
  },
  {
    id: "l2",
    name: "Sushila Tamang",
    category: "Loan",
    phone: "+977-9852345678",
    email: "sushila.tamang@himalayabank.com.np",
    specialty: "Commercial property loans and SME mortgage advisor at Himalayan Bank.",
  },
  {
    id: "l3",
    name: "Bikash Shrestha",
    category: "Loan",
    phone: "+977-9863456789",
    email: "bikash.shrestha@niblbank.com.np",
    specialty: "Fast-track land purchase loans and balance transfer expert at NIBL.",
  },
  {
    id: "l4",
    name: "Pramila Karki",
    category: "Loan",
    phone: "+977-9874567890",
    email: "pramila.karki@example.com",
    specialty: "NRN remittance-backed land loans and joint property financing consultant.",
  },

  // Insurance
  {
    id: "i1",
    name: "Dipesh Rai",
    category: "Insurance",
    phone: "+977-9845678901",
    email: "dipesh.rai@nepalinsurance.com.np",
    specialty: "Land title insurance and property damage coverage advisor at Nepal Insurance.",
  },
  {
    id: "i2",
    name: "Anita Gurung",
    category: "Insurance",
    phone: "+977-9856789012",
    email: "anita.gurung@primelife.com.np",
    specialty: "Comprehensive property & construction risk insurance specialist.",
  },
  {
    id: "i3",
    name: "Nabin Pokhrel",
    category: "Insurance",
    phone: "+977-9867890123",
    email: "nabin.pokhrel@example.com",
    specialty: "Agricultural land and crop loss insurance packages for rural buyers.",
  },

  // Surveyor
  {
    id: "s1",
    name: "Govinda Thapa",
    category: "Surveyor",
    phone: "+977-9848901234",
    email: "govinda.thapa@survey.gov.np",
    specialty: "Licensed government surveyor — boundary demarcation and lal-purja verification.",
  },
  {
    id: "s2",
    name: "Mina Bhandari",
    category: "Surveyor",
    phone: "+977-9859012345",
    email: "mina.bhandari@example.com",
    specialty: "Topographic land surveying and GIS mapping for Kathmandu Valley plots.",
  },
  {
    id: "s3",
    name: "Rajan Adhikari",
    category: "Surveyor",
    phone: "+977-9870123456",
    email: "rajan.adhikari@example.com",
    specialty: "Drone-assisted land area measurement and dispute resolution surveys.",
  },
  {
    id: "s4",
    name: "Kamala Basnet",
    category: "Surveyor",
    phone: "+977-9881234567",
    email: "kamala.basnet@example.com",
    specialty: "Road-setback compliance checks and urban development zone surveys.",
  },

  // Lawyer
  {
    id: "lw1",
    name: "Adv. Suresh Paudel",
    category: "Lawyer",
    phone: "+977-9842345678",
    email: "suresh.paudel@lawchamber.com.np",
    specialty: "Real estate transaction law, title disputes, and land registration specialist.",
  },
  {
    id: "lw2",
    name: "Adv. Sabina Koirala",
    category: "Lawyer",
    phone: "+977-9853456789",
    email: "sabina.koirala@example.com",
    specialty: "NRN property ownership, dual-citizenship land rights, and joint ownership agreements.",
  },
  {
    id: "lw3",
    name: "Adv. Prabin Maharjan",
    category: "Lawyer",
    phone: "+977-9864567890",
    email: "prabin.maharjan@example.com",
    specialty: "Inheritance and succession disputes, partition deeds, and ancestral property cases.",
  },
];

const CATEGORY_CONFIG: Record<Exclude<Category, "All">, { icon: React.ReactNode; color: string; bg: string; border: string; shadow: string }> = {
  Loan: {
    icon: <LucideBanknote className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    shadow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  },
  Insurance: {
    icon: <LucideShieldCheck className="w-5 h-5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    shadow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
  Surveyor: {
    icon: <LucideRuler className="w-5 h-5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    shadow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  },
  Lawyer: {
    icon: <LucideScale className="w-5 h-5" />,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    shadow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
  },
};

const TAB_ACTIVE: Record<Category, string> = {
  All: "bg-white/10 text-white border-white/20 shadow-md",
  Loan: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
  Insurance: "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.3)]",
  Surveyor: "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
  Lawyer: "bg-violet-500/15 text-violet-400 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.3)]",
};

const CATEGORIES: Category[] = ["All", "Loan", "Insurance", "Surveyor", "Lawyer"];

export default function FindProfessionalView() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? PROFESSIONALS
        : PROFESSIONALS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <div className="relative animate-fade-in z-10 w-full mt-4">
      {/* Ambient glows */}
      <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-20 left-0 w-[350px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-md">
          Find a Professional
        </h2>
        <p className="text-white/50 text-xs font-medium mt-1">
          Connect with verified loan advisors, insurance agents, surveyors, and lawyers for your land transaction.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 relative z-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-1.5 ${
              activeCategory === cat
                ? TAB_ACTIVE[cat]
                : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {cat !== "All" && (
              <span className={activeCategory === cat ? CATEGORY_CONFIG[cat as Exclude<Category, "All">].color : "text-white/30"}>
                {CATEGORY_CONFIG[cat as Exclude<Category, "All">].icon}
              </span>
            )}
            {cat === "All" ? "All Categories" : cat}
            <span
              className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeCategory === cat ? "bg-white/20" : "bg-white/5 text-white/30"
              }`}
            >
              {cat === "All" ? PROFESSIONALS.length : PROFESSIONALS.filter((p) => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10"
        >
          {filtered.map((pro) => {
            const cfg = CATEGORY_CONFIG[pro.category];
            return (
              <div
                key={pro.id}
                className={`bg-[#0a111a] border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] ${cfg.border} ${cfg.shadow}`}
              >
                {/* Category badge + name */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{pro.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        {pro.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specialty */}
                <div className={`flex gap-2 mb-4 p-3 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                  <LucideInfo className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.color}`} />
                  <p className="text-xs text-white/70 leading-relaxed">{pro.specialty}</p>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5">
                  <a
                    href={`tel:${pro.phone}`}
                    className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors group"
                  >
                    <LucidePhone className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
                    <span className="group-hover:underline underline-offset-2">{pro.phone}</span>
                  </a>
                  <a
                    href={`mailto:${pro.email}`}
                    className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors group"
                  >
                    <LucideMail className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
                    <span className="group-hover:underline underline-offset-2">{pro.email}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Info banner at bottom */}
      <div className="mt-8 bg-[#0a111a] border border-white/10 rounded-2xl p-5 flex gap-3 relative z-10">
        <LucideUser className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          These professionals are listed as a convenience directory for land buyers. Contact them directly using the details above. Always verify credentials independently before entering any financial or legal agreement.
        </p>
      </div>
    </div>
  );
}
