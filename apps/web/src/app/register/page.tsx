"use client";

import React, { useState } from "react";
import { useAuth, UserRole } from "../../context/AuthContext";
import Link from "next/link";
import { LucideLock, LucideMail, LucideUser, LucideLoader2, LucideUsers, LucideHome } from "lucide-react";
import VishwasGharLogo from "../../components/VishwasGharLogo";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CUSTOMER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(email, name, password, role);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-background to-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl shadow-2xl border border-white/10 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <VishwasGharLogo size="lg" showTagline />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Create your account — विश्वास तपाईको, घर हाम्रो
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="full-name" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LucideUser className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-muted-foreground focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm transition-all"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LucideMail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-muted-foreground focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LucideLock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-muted-foreground focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm transition-all"
                  placeholder="Choose Password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                I want to join as:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("CUSTOMER")}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all ${
                    role === "CUSTOMER"
                      ? "border-primary bg-primary/25 text-white"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <LucideUsers className="h-4 w-4" />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("AGENT")}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all ${
                    role === "AGENT"
                      ? "border-primary bg-primary/25 text-white"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <LucideUser className="h-4 w-4" />
                  Agent
                </button>
                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all ${
                    role === "SELLER"
                      ? "border-emerald-500 bg-emerald-500/20 text-white"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <LucideHome className="h-4 w-4" />
                  Seller
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-700 hover:bg-blue-600 py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              {loading ? (
                <LucideLoader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
