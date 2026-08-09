"use client";

import React from "react";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LucideHome, LucideLoader2 } from "lucide-react";
import SellerDashboardView from "../../../components/SellerDashboardView";

export default function SellerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Guard: only SELLER role may access this page
  if (user && user.role !== "SELLER") {
    router.push("/dashboard");
    return null;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10 animate-fade-in">

        {/* Welcome Banner */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 flex items-center gap-6 shadow-xl bg-gradient-to-r from-emerald-500/10 via-background to-background">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            alt={user.name}
            className="h-16 w-16 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit">
              <LucideHome className="w-3 h-3" /> Seller Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{user.name}</span>!
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              List your property, upload documents, and connect with your assigned broker.
            </p>
          </div>
        </div>

        <SellerDashboardView />

      </main>
    </div>
  );
}
