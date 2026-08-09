"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER" | "SELLER";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  is_online: boolean;
  is_verified?: boolean;
  is_pro?: boolean;
  rating?: number;
  avg_response_time_minutes?: number;
  trust_score?: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    // Load tokens from localStorage on startup
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Handle route protection
  useEffect(() => {
    if (loading) return;

    const publicPaths = ["/login", "/register", "/listings", "/"];
    const isPublicPath = publicPaths.some(
      (path) => pathname === path || pathname.startsWith("/listings/")
    );

    if (!user && !isPublicPath) {
      router.push("/login");
    } else if (user) {
      // Role claims route guards
      if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
        router.push("/dashboard");
      }
      if (pathname === "/dashboard" && user.role === "SELLER") {
        router.push("/dashboard/seller");
      }
    }
  }, [user, pathname, loading, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Invalid login credentials");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      
      // Fetch user profile
      const profileRes = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      
      if (!profileRes.ok) throw new Error("Could not fetch user profile");
      
      const userData = await profileRes.json();
      localStorage.setItem("user", JSON.stringify(userData));
      
      setAccessToken(data.access_token);
      setUser(userData);

      if (userData.role === "ADMIN") {
        router.push("/admin");
      } else if (userData.role === "AGENT") {
        router.push("/dashboard/subscription");
      } else if (userData.role === "SELLER") {
        router.push("/dashboard/seller");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (email: string, name: string, password: string, role: UserRole) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      // Auto login after registration
      await login(email, password);
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setAccessToken(null);
      setUser(null);
      router.push("/login");
    }
  };

  const refreshSession = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) throw new Error("Session refresh failed");

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setAccessToken(data.access_token);
      return data.access_token;
    } catch (err) {
      console.error("Token refresh error, logging out:", err);
      await logout();
      return null;
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = accessToken;

    // Safely check if token is expired
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          if (isExpired) {
            token = await refreshSession();
          }
        }
      } catch {
        // Malformed token — try to refresh
        token = await refreshSession();
      }
    }

    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized (expired token fallback)
    if (response.status === 401) {
      const newToken = await refreshSession();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        return fetch(url, { ...options, headers });
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
