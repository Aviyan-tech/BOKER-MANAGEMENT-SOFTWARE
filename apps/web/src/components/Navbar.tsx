"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { LucideBell, LucideCompass, LucideLayoutDashboard, LucideLogOut, LucideMessageSquare, LucideUser } from "lucide-react";
import VishwasGharLogo from "./VishwasGharLogo";

export default function Navbar() {
  const { user, accessToken, logout, fetchWithAuth } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  const fetchNotifications = async () => {
    if (!user || !accessToken) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read_at).length);
      }
    } catch (err) {
      // Backend may not be reachable — fail silently
    }
  };

  useEffect(() => {
    if (!user || !accessToken) return;

    fetchNotifications();

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(`${WS_URL}/ws/chat?token=${accessToken}`);

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "notification:new") {
            setNotifications((prev) => [payload.data, ...prev]);
            setUnreadCount((c) => c + 1);
          }
        } catch {
          // ignore malformed WS messages
        }
      };

      socket.onerror = () => {
        // ignore WS errors — backend may not be running yet
      };
    } catch {
      // ignore WebSocket construction errors
    }

    return () => {
      if (socket) socket.close();
    };
  }, [user, accessToken]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/notifications/read-all`, {
        method: "POST"
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-lg">
      <Link href="/" className="flex items-center gap-2">
        <VishwasGharLogo size="md" />
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
        >
          <LucideCompass className="h-4 w-4" />
          Browse Land
        </Link>

        {user ? (
          <>
            <Link
              href={user.role === "ADMIN" ? "/admin" : user.role === "SELLER" ? "/dashboard/seller" : "/dashboard"}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              <LucideLayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/chats"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors relative"
            >
              <LucideMessageSquare className="h-4 w-4" />
              Chat
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer"
              >
                <LucideBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-panel p-4 rounded-xl shadow-xl border border-white/10 text-sm animate-scale-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="font-semibold text-white">Notifications ({unreadCount})</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:text-primary/80 font-bold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-4">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => {
                        let text = "";
                        let route = "/dashboard";
                        if (notif.type === "new_message") {
                          text = `New message from ${notif.payload.sender_name}: "${notif.payload.content}"`;
                          route = notif.payload.deal_id ? `/dashboard/deals/${notif.payload.deal_id}` : "/dashboard/chats";
                        } else if (notif.type === "new_offer") {
                          text = `New offer of $${notif.payload.amount / 100} by ${notif.payload.offered_by_name}`;
                          route = `/dashboard/deals/${notif.payload.deal_id}`;
                        } else if (notif.type === "deal_stage_changed") {
                          text = `Deal stage changed to ${notif.payload.stage}`;
                          route = `/dashboard/deals/${notif.payload.deal_id}`;
                        } else if (notif.type === "offer_status_changed") {
                          text = `Your offer of $${notif.payload.amount / 100} was ${notif.payload.status}`;
                          route = `/dashboard/deals/${notif.payload.deal_id}`;
                        }
                        
                        return (
                          <Link
                            key={notif.id}
                            href={route}
                            onClick={() => setNotifDropdownOpen(false)}
                            className={`block p-2.5 rounded-lg border transition-all text-xs ${
                              notif.read_at
                                ? "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                : "bg-primary/10 border-primary/20 text-white font-semibold hover:bg-primary/20"
                            }`}
                          >
                            <p className="line-clamp-2">{text}</p>
                            <span className="block text-[8px] text-neutral-500 mt-1">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer"
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                  alt={user.name}
                  className="h-6 w-6 rounded-full"
                />
                <span className="text-sm font-semibold text-white max-w-[100px] truncate">
                  {user.name}
                </span>
                <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold">
                  {user.role}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 glass-panel py-2 rounded-xl shadow-xl border border-white/10 animate-scale-in">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LucideUser className="h-4 w-4" />
                    My Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LucideLogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)]"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
