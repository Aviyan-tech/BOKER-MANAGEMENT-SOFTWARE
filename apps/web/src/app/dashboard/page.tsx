"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LucideLayoutDashboard, LucideGrid, LucideCompass, LucideMessageSquare, LucideUser, LucideArrowRight, LucideCalendarDays, LucideUsers, LucideSearch, LucideShieldCheck, LucideCrown, LucideSparkles, LucideUserCheck } from "lucide-react";
import ScheduleView from "../../components/ScheduleView";
import CustomerTrackerView from "../../components/CustomerTrackerView";
import FindSellersView from "../../components/FindSellersView";
import FindProfessionalView from "../../components/FindProfessionalView";
import BrokerVerificationModal from "../../components/BrokerVerificationModal";
import VerifiedBadge from "../../components/VerifiedBadge";
import BrokerProBadge from "../../components/BrokerProBadge";
import TrustScoreBadge from "../../components/TrustScoreBadge";

export default function DashboardLandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"Overview" | "Schedule" | "Leads" | "Find Sellers">("Overview");
  const [customerTab, setCustomerTab] = React.useState<"Overview" | "Find Professional">("Overview");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = React.useState(false);

  if (!user) return null;

  const isAgent = user.role === "AGENT";
  const isAdmin = user.role === "ADMIN";

  // Sellers have their own dedicated dashboard
  if (user.role === "SELLER") {
    router.push("/dashboard/seller");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10 animate-fade-in">
        
        {/* Welcome Banner */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 flex items-center gap-6 shadow-xl bg-gradient-to-r from-primary/10 via-background to-background">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            alt={user.name}
            className="h-16 w-16 rounded-full border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
              {user.role} Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Welcome back, <span className="text-gradient">{user.name}</span>!
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Manage your platform interactions and live deal rooms.</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        {isAgent && (
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab("Overview")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "Overview" 
                  ? "bg-white/10 text-white shadow-md border border-white/20" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LucideLayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("Schedule")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "Schedule" 
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-primary/30" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LucideCalendarDays className="w-4 h-4" />
              My Schedule
            </button>
            <button
              onClick={() => setActiveTab("Leads")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "Leads" 
                  ? "bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/30" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LucideUsers className="w-4 h-4" />
              Customer Tracker
            </button>
            <button
              onClick={() => setActiveTab("Find Sellers")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "Find Sellers" 
                  ? "bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-orange-500/30" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LucideSearch className="w-4 h-4" />
              Find Sellers
            </button>
          </div>
        )}

        {/* Tab Content */}
        {(!isAgent || activeTab === "Overview") && (
          <div className="space-y-10 animate-fade-in">

            {/* Customer nav tabs (non-agent only) */}
            {!isAgent && (
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <button
                  onClick={() => setCustomerTab("Overview")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    customerTab === "Overview"
                      ? "bg-white/10 text-white shadow-md border border-white/20"
                      : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <LucideLayoutDashboard className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setCustomerTab("Find Professional")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    customerTab === "Find Professional"
                      ? "bg-violet-500/20 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-500/30"
                      : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <LucideUserCheck className="w-4 h-4" />
                  Find a Professional
                </button>
              </div>
            )}

            {/* Customer: Find a Professional tab content */}
            {!isAgent && customerTab === "Find Professional" && (
              <FindProfessionalView />
            )}

            {/* Overview content — shown for agents always, customers only on Overview tab */}
            {(isAgent || customerTab === "Overview") && (
              <>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Action 1: Deals Pipeline */}
                <button
                  onClick={() => router.push("/dashboard/deals")}
                  className="glass-panel p-6 rounded-2xl border border-white/10 text-left hover:border-primary/50 hover:bg-white/5 transition-all group flex justify-between items-center cursor-pointer"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                      <LucideLayoutDashboard className="h-4 w-4 text-primary" />
                      Deals Pipeline
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isAgent 
                        ? "Track client negotiations on the Kanban pipeline." 
                        : "Track status and details of your inquiries."}
                    </p>
                  </div>
                  <LucideArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>

                {/* Action 2: Manage listings (Agent) / Browse listings (Customer) */}
                {isAgent ? (
                  <button
                    onClick={() => router.push("/dashboard/listings")}
                    className="glass-panel p-6 rounded-2xl border border-white/10 text-left hover:border-primary/50 hover:bg-white/5 transition-all group flex justify-between items-center cursor-pointer"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                        <LucideGrid className="h-4 w-4 text-primary" />
                        Manage Listings
                      </h4>
                      <p className="text-xs text-muted-foreground">List new land parcels and upload certificates.</p>
                    </div>
                    <LucideArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ) : (
                  <>
                  <button
                    onClick={() => router.push("/")}
                    className="glass-panel p-6 rounded-2xl border border-white/10 text-left hover:border-primary/50 hover:bg-white/5 transition-all group flex justify-between items-center cursor-pointer"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                        <LucideCompass className="h-4 w-4 text-primary" />
                        Browse Land Marketplace
                      </h4>
                      <p className="text-xs text-muted-foreground">Find and negotiate on active land listings.</p>
                    </div>
                    <LucideArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Action: Find a Professional (Customer only) */}
                  <button
                    onClick={() => setCustomerTab("Find Professional")}
                    className="glass-panel p-6 rounded-2xl border border-white/10 text-left hover:border-violet-500/50 hover:bg-white/5 transition-all group flex justify-between items-center cursor-pointer md:col-span-2"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors text-sm flex items-center gap-2">
                        <LucideUserCheck className="h-4 w-4 text-violet-400" />
                        Find a Professional
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Connect with loan advisors, insurance agents, surveyors, and lawyers for your land deal.
                      </p>
                    </div>
                    <LucideArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </button>
                  </>
                )}

                {/* Action 3: Chat Inbox (Agent only) */}
                {isAgent && (
                  <button
                    onClick={() => router.push("/dashboard/chats")}
                    className="glass-panel p-6 rounded-2xl border border-white/10 text-left hover:border-primary/50 hover:bg-white/5 transition-all group flex justify-between items-center cursor-pointer md:col-span-2"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                        <LucideMessageSquare className="h-4 w-4 text-primary" />
                        Direct Messages
                      </h4>
                      <p className="text-xs text-muted-foreground">Chat directly with other brokers and listing agents.</p>
                    </div>
                    <LucideArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                )}

                {/* Action 4: Admin approvals (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => router.push("/admin")}
                    className="glass-panel p-6 rounded-2xl border border-white/10 text-left hover:border-primary/50 hover:bg-white/5 transition-all group flex justify-between items-center cursor-pointer md:col-span-2"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                        <LucideLayoutDashboard className="h-4 w-4 text-primary" />
                        Admin Approvals Panel
                      </h4>
                      <p className="text-xs text-muted-foreground">Approve new listings and monitor platform analytics.</p>
                    </div>
                    <LucideArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>
            </div>

            {/* Broker Verification & Pro Subscription Banner */}
            {isAgent && (
              <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-amber-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LucideShieldCheck className="w-5 h-5 text-blue-400" />
                    <h4 className="font-extrabold text-white text-base">Broker Verification & Trust System</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get Rs. 500 Blue Badge Verification or upgrade to Rs. 2,000/mo Broker Pro for featured property boosts.
                  </p>
                </div>
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
                >
                  <LucideCrown className="w-4 h-4 text-amber-300" /> Upgrade Status
                </button>
              </div>
            )}

            {/* Profile Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <LucideUser className="h-4 w-4 text-primary" />
                My Profile Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="block text-muted-foreground font-semibold">Name</span>
                  <span className="text-white font-bold block mt-0.5">{user.name}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-semibold">Email</span>
                  <span className="text-white font-bold block mt-0.5">{user.email}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-semibold">Verification Badge</span>
                  <span className="block mt-0.5">
                    {user.is_verified ? <VerifiedBadge showText size="sm" /> : <span className="text-white/40">Unverified</span>}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-semibold">Broker Status</span>
                  <span className="block mt-0.5">
                    {user.is_pro ? <BrokerProBadge size="sm" /> : <span className="text-white/40">Standard</span>}
                  </span>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}
        
        {isAgent && activeTab === "Schedule" && (
          <ScheduleView />
        )}

        {isAgent && activeTab === "Leads" && (
          <CustomerTrackerView />
        )}

        {isAgent && activeTab === "Find Sellers" && (
          <FindSellersView />
        )}

      </main>

      {/* Verification & Pro Upgrade Modal */}
      <BrokerVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </div>
  );
}
