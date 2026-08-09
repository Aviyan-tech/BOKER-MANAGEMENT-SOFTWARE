"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LucideLayoutDashboard, LucideGrid, LucideEye, LucideUsers, LucideActivity, LucideCheck, LucideLoader2 } from "lucide-react";

interface Analytics {
  total_listings: number;
  total_deals: number;
  total_users: number;
  total_views: number;
}

interface Listing {
  id: number;
  title: string;
  location: string;
  price: number;
  land_type: string;
  agent: { name: string; email: string };
}

export default function AdminDashboardPage() {
  const { user, fetchWithAuth } = useAuth();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [unapprovedListings, setUnapprovedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, listingsRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/api/v1/admin/analytics`),
        fetchWithAuth(`${API_URL}/api/v1/admin/unapproved-listings`)
      ]);

      if (analyticsRes.ok && listingsRes.ok) {
        setAnalytics(await analyticsRes.json());
        setUnapprovedListings(await listingsRes.json());
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchAdminData();
      }
    }
  }, [user]);

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/admin/listings/${id}/approve`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <LucideLayoutDashboard className="h-8 w-8 text-primary" />
            Platform Administration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor metrics and approve incoming listings</p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="p-3.5 bg-primary/20 rounded-xl border border-primary/30">
              <LucideGrid className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold uppercase">Total Listings</span>
              <span className="text-2xl font-black text-white">{analytics.total_listings}</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="p-3.5 bg-green-500/20 rounded-xl border border-green-500/30">
              <LucideActivity className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold uppercase">Total Deals</span>
              <span className="text-2xl font-black text-white">{analytics.total_deals}</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="p-3.5 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
              <LucideEye className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold uppercase">Total Views</span>
              <span className="text-2xl font-black text-white">{analytics.total_views}</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <LucideUsers className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold uppercase">Registered Users</span>
              <span className="text-2xl font-black text-white">{analytics.total_users}</span>
            </div>
          </div>
        </div>

        {/* Listings Approval Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white">Pending Approvals ({unapprovedListings.length})</h2>

          {unapprovedListings.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No listings currently awaiting approval.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/5">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-white/5 text-white font-semibold">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Agent</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {unapprovedListings.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{item.title}</td>
                      <td className="px-6 py-4">{item.location}</td>
                      <td className="px-6 py-4">{formatPrice(item.price)}</td>
                      <td className="px-6 py-4 uppercase font-semibold text-primary">{item.land_type}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{item.agent.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.agent.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={approvingId === item.id}
                          className="bg-accent hover:bg-accent/95 text-white font-bold py-1.5 px-3.5 rounded-lg flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all cursor-pointer inline-flex"
                        >
                          {approvingId === item.id ? (
                            <LucideLoader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <LucideCheck className="h-3 w-3" />
                          )}
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
