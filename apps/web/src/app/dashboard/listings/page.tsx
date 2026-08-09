"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LucidePlus, LucideEye, LucideGrid, LucideMapPin, LucideUpload, LucideCheck, LucideTrash, LucideFileText, LucideLoader2 } from "lucide-react";

interface Listing {
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
  view_count: number;
}

export default function AgentListingsPage() {
  const { user, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("0.0");
  const [lng, setLng] = useState("0.0");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("sqft");
  const [price, setPrice] = useState(""); // in dollars
  const [landType, setLandType] = useState("residential");
  const [submitting, setSubmitting] = useState(false);

  // Upload state
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/listings?only_approved=false`);
      if (res.ok) {
        const data = await res.json();
        // Filter listings created by this agent
        const myData = data.filter((item: any) => item.agent_id === user?.id);
        setListings(myData);
      }
    } catch (err) {
      console.error("Error loading agent listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        title,
        description,
        location,
        lat: Number(lat),
        lng: Number(lng),
        area: Number(area),
        area_unit: areaUnit,
        price: Number(price) * 100, // dollars to cents
        land_type: landType,
      };

      const res = await fetchWithAuth(`${API_URL}/api/v1/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        // Clear fields
        setTitle("");
        setDescription("");
        setLocation("");
        setArea("");
        setPrice("");
        fetchMyListings();
      } else {
        const err = await res.json();
        alert(err.detail || "Error creating listing");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/listings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMyListings();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleFileUpload = async (listingId: number, type: "image" | "certificate", file: File) => {
    setUploadingId(listingId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const endpoint = type === "image" 
        ? `${API_URL}/api/v1/listings/${listingId}/images`
        : `${API_URL}/api/v1/listings/${listingId}/certificates`;

      const res = await fetchWithAuth(endpoint, {
        method: "POST",
        body: formData, // fetchWithAuth will correctly handle multipart if headers are omitted, but let's make sure it doesn't set Content-Type JSON!
      });

      if (res.ok) {
        alert(`${type === "image" ? "Cover Image" : "Land Certificate"} uploaded successfully!`);
        fetchMyListings();
      } else {
        const err = await res.json();
        alert(err.detail || "Upload failed");
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Manage Listings</h1>
            <p className="text-sm text-muted-foreground mt-1">Create, update, and manage your active land parcels</p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer text-sm"
          >
            <LucidePlus className="h-4 w-4" />
            Add Listing
          </button>
        </div>

        {/* Listings Table */}
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
            <p className="text-muted-foreground text-sm">You haven't listed any land parcels yet.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-white/5 border-b border-white/10 text-white font-semibold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Area</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Uploads</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white max-w-[150px] truncate">{item.title}</td>
                    <td className="px-6 py-4 max-w-[150px] truncate">{item.location}</td>
                    <td className="px-6 py-4">{item.area} {item.area_unit}</td>
                    <td className="px-6 py-4">{formatPrice(item.price)}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        <LucideEye className="h-4 w-4 text-cyan-400" />
                        {item.view_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                          <LucideUpload className="h-3 w-3" />
                          Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleFileUpload(item.id, "image", e.target.files[0]);
                            }}
                            className="hidden"
                          />
                        </label>
                        <label className="cursor-pointer text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                          <LucideFileText className="h-3 w-3" />
                          Cert (PDF)
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleFileUpload(item.id, "certificate", e.target.files[0]);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => router.push(`/listings/${item.id}`)}
                          className="text-xs font-medium text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg"
                        >
                          <LucideTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative animate-scale-in">
              <h2 className="text-xl font-bold text-white mb-6">Create New Land Listing</h2>
              
              <form onSubmit={handleCreate} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g., Beautiful Sunset Valley Acres"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter details about zoning, utilities, road access..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Location Address</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Land Type</label>
                    <select
                      value={landType}
                      onChange={(e) => setLandType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary"
                    >
                      <option value="residential" className="bg-neutral-900">Residential</option>
                      <option value="commercial" className="bg-neutral-900">Commercial</option>
                      <option value="agricultural" className="bg-neutral-900">Agricultural</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Area</label>
                    <input
                      type="number"
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. 5.2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Area Unit</label>
                    <input
                      type="text"
                      required
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. acres, sqft"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Asking Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. 150000"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary hover:bg-primary/95 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                  >
                    {submitting && <LucideLoader2 className="h-4 w-4 animate-spin" />}
                    Save Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
