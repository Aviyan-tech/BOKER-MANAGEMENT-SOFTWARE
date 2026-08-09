"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LucideCompass, LucideArrowRight, LucideUser, LucideFileText, LucideCheck, LucideChevronRight } from "lucide-react";

interface Deal {
  id: number;
  listing_id: number;
  customer_id: number;
  agent_id: number;
  stage: string;
  created_at: string;
  listing: { title: string; price: number; location: string };
  customer: { name: string; email: string };
  agent: { name: string; email: string };
}

const STAGES = ["Inquired", "Site Visit Scheduled", "Negotiating", "Closed"];

export default function DealsPipelinePage() {
  const { user, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/deals`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch (err) {
      console.error("Error loading deals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeals();
    }
  }, [user]);

  const handleStageChange = async (dealId: number, newStage: string) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/deals/${dealId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, note: `Pipeline stage moved to ${newStage}` }),
      });
      if (res.ok) {
        fetchDeals();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to update stage");
      }
    } catch (err) {
      console.error("Stage update error:", err);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Deals Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "AGENT" 
              ? "Track your client deals through the sales pipeline" 
              : "Track the status of your land purchases"}
          </p>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
            <p className="text-muted-foreground text-sm">No active deals found.</p>
            {user?.role === "CUSTOMER" && (
              <button
                onClick={() => router.push("/")}
                className="mt-4 bg-primary text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 hover:bg-primary/90 transition-all"
              >
                Browse Listings
              </button>
            )}
          </div>
        ) : (
          /* Kanban Board Layout */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage);
              return (
                <div key={stage} className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col max-h-[70vh]">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                    <span className="font-bold text-white text-sm">{stage}</span>
                    <span className="bg-primary/25 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="space-y-4 overflow-y-auto pr-1">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={(e) => {
                          // Prevent triggering if clicking on select/dropdown
                          if ((e.target as HTMLElement).tagName !== "SELECT") {
                            router.push(`/dashboard/deals/${deal.id}`);
                          }
                        }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer space-y-3 group glass-panel-hover"
                      >
                        <div>
                          <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {deal.listing.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {deal.listing.location}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                          <span className="text-white font-semibold">
                            {formatPrice(deal.listing.price)}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <LucideUser className="h-3 w-3" />
                            {user?.role === "AGENT" ? deal.customer.name : deal.agent.name}
                          </span>
                        </div>

                        {/* Move Stage Selector for Agent */}
                        {user?.role === "AGENT" && (
                          <div className="pt-2">
                            <select
                              value={deal.stage}
                              onChange={(e) => handleStageChange(deal.id, e.target.value)}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg text-[10px] p-1.5 focus:outline-none text-white cursor-pointer"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  Move to: {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
