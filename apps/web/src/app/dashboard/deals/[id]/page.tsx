"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import { useAuth } from "../../../../context/AuthContext";
import { LucideCompass, LucideCheck, LucideMessageSquare, LucideDollarSign, LucideHistory, LucideSend, LucideFileText, LucideCircle, LucideX, LucideLoader2, LucidePenTool } from "lucide-react";
import AgreementModal from "../../../../components/AgreementModal";

interface DealDetail {
  id: number;
  listing_id: number;
  customer_id: number;
  agent_id: number;
  stage: string;
  created_at: string;
  updated_at: string;
  listing: { title: string; price: number; location: string };
  customer: { id: number; name: string; email: string; avatar_url?: string };
  agent: { id: number; name: string; email: string; avatar_url?: string };
  stage_histories: { id: number; stage: string; changed_by_id: number; changed_at: string; note?: string }[];
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

interface Offer {
  id: number;
  deal_id: number;
  offered_by_id: number;
  amount: number;
  note?: string;
  status: string;
  created_at: string;
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken, fetchWithAuth } = useAuth();
  
  const dealId = params?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Input states
  const [chatInput, setChatInput] = useState("");
  const [offerInput, setOfferInput] = useState("");
  const [offerNote, setOfferNote] = useState("");
  
  // Negotiation room active offer states
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [chatTyping, setChatTyping] = useState(false);
  const [opponentChatTyping, setOpponentChatTyping] = useState(false);
  const [opponentNegTyping, setOpponentNegTyping] = useState(false);

  // Sockets
  const chatSocket = useRef<WebSocket | null>(null);
  const negSocket = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const fetchDealDetail = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/deals/${dealId}`);
      if (res.ok) {
        const data = await res.json();
        setDeal(data);
      }
    } catch (err) {
      console.error("Error loading deal:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/messages?deal_id=${dealId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/offers?deal_id=${dealId}`);
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.error("Error loading offers:", err);
    }
  };

  // Main loader
  useEffect(() => {
    if (dealId && user) {
      const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchDealDetail(), fetchMessages(), fetchOffers()]);
        setLoading(false);
      };
      loadAll();
    }
  }, [dealId, user]);

  // Connect WebSockets
  useEffect(() => {
    if (!accessToken || !deal) return;

    const opposingUserId = user?.id === deal.agent_id ? deal.customer_id : deal.agent_id;

    // Connect Chat Socket
    const cSocket = new WebSocket(`${WS_URL}/ws/chat?token=${accessToken}`);
    chatSocket.current = cSocket;

    cSocket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const { event: wsEvent, data } = payload;

      if (wsEvent === "chat:message") {
        if (data.deal_id === Number(dealId)) {
          setMessages((prev) => [...prev, data]);
        }
      } else if (wsEvent === "chat:typing") {
        if (data.sender_id === opposingUserId && data.deal_id === Number(dealId)) {
          setOpponentChatTyping(data.is_typing);
        }
      }
    };

    // Connect Negotiation Socket
    const nSocket = new WebSocket(`${WS_URL}/ws/negotiation/${dealId}?token=${accessToken}`);
    negSocket.current = nSocket;

    nSocket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const { event: wsEvent, data } = payload;

      if (wsEvent === "negotiation:offer" || wsEvent === "negotiation:offer-status") {
        // Reload details and offer timeline
        fetchOffers();
        fetchDealDetail();
      } else if (wsEvent === "negotiation:typing") {
        if (data.user_id === opposingUserId) {
          setOpponentNegTyping(data.is_typing);
        }
      }
    };

    return () => {
      cSocket.close();
      nSocket.close();
    };
  }, [accessToken, deal]);

  // Scroll bottom on chat load
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, opponentChatTyping]);

  // Chat send helper
  const handleSendChat = () => {
    if (!chatInput.trim() || !chatSocket.current || !deal) return;
    
    const opposingUserId = user?.id === deal.agent_id ? deal.customer_id : deal.agent_id;
    
    const payload = {
      event: "chat:message",
      data: {
        receiver_id: opposingUserId,
        content: chatInput,
        deal_id: Number(dealId),
      },
    };
    
    chatSocket.current.send(JSON.stringify(payload));
    setChatInput("");
    sendChatTyping(false);
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);

    if (!chatTyping) {
      setChatTyping(true);
      sendChatTyping(true);
    }

    const timer = setTimeout(() => {
      setChatTyping(false);
      sendChatTyping(false);
    }, 2000);

    return () => clearTimeout(timer);
  };

  const sendChatTyping = (status: boolean) => {
    if (!chatSocket.current || !deal) return;
    const opposingUserId = user?.id === deal.agent_id ? deal.customer_id : deal.agent_id;
    chatSocket.current.send(
      JSON.stringify({
        event: "chat:typing",
        data: {
          receiver_id: opposingUserId,
          deal_id: Number(dealId),
          is_typing: status,
        },
      })
    );
  };

  // Submit structured offer
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerInput || !deal) return;

    setSubmittingOffer(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: Number(dealId),
          amount: Number(offerInput) * 100, // dollars to cents
          note: offerNote,
        }),
      });

      if (res.ok) {
        setOfferInput("");
        setOfferNote("");
      } else {
        const err = await res.json();
        alert(err.detail || "Offer submission failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Accept or Reject offer
  const handleOfferStatusUpdate = async (offerId: number, statusAction: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/offers/${offerId}?status_update=${statusAction}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  if (loading || !deal) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const opposingUser = user?.id === deal.agent_id ? deal.customer : deal.agent;
  const activeOffer = offers.find((o) => o.status === "PENDING");
  const isOpponentOffer = activeOffer && activeOffer.offered_by_id !== user?.id;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[85vh] overflow-hidden">
        
        {/* Left Side: Property details and Stage Timeline */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">{deal.listing.title}</h2>
            <p className="text-xs text-muted-foreground">{deal.listing.location}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-block text-xs font-semibold bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase">
                {deal.stage}
              </span>
              <button
                onClick={() => setIsAgreementOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]"
              >
                <LucidePenTool className="w-3.5 h-3.5 text-sky-400" /> Contract & Signatures
              </button>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <LucideHistory className="h-4 w-4 text-primary" />
              Activity History
            </h3>

            <div className="space-y-4 relative pl-4 border-l border-white/10">
              {deal.stage_histories.map((hist) => (
                <div key={hist.id} className="relative text-xs space-y-1">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary border border-black"></span>
                  <p className="font-bold text-white">{hist.stage}</p>
                  <p className="text-neutral-400 text-[10px] leading-relaxed">{hist.note}</p>
                  <p className="text-[9px] text-neutral-500">
                    {new Date(hist.changed_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Side: Chat Room */}
        <div className="glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <LucideMessageSquare className="h-5 w-5 text-primary" />
              Chat Room with {opposingUser.name}
            </h3>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 text-sm ${
                      isMe 
                        ? "bg-primary text-white rounded-tr-none shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                        : "bg-white/5 text-neutral-200 border border-white/5 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="block text-[9px] text-white/50 text-right mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {opponentChatTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 text-muted-foreground rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1">
                  <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={chatInput}
                onChange={handleChatInputChange}
                placeholder="Send secure message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary text-sm transition-all"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              >
                <LucideSend className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Negotiation Room */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col overflow-y-auto space-y-6">
          <div className="flex items-center gap-2">
            <LucideDollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-white">Live Deal Negotiation</h3>
          </div>

          {/* Active Offer Status */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h4 className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Current Offer Status</h4>
            {activeOffer ? (
              <div className="space-y-4">
                <div>
                  <span className="text-3xl font-black text-white">{formatPrice(activeOffer.amount)}</span>
                  {activeOffer.note && <p className="text-xs text-neutral-300 mt-2 italic">"{activeOffer.note}"</p>}
                </div>

                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Offered by: {activeOffer.offered_by_id === user?.id ? "You" : opposingUser.name}</span>
                  <span>{new Date(activeOffer.created_at).toLocaleTimeString()}</span>
                </div>

                {/* Offer actions */}
                {isOpponentOffer && deal.stage !== "Closed" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleOfferStatusUpdate(activeOffer.id, "ACCEPTED")}
                      className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all cursor-pointer"
                    >
                      <LucideCheck className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleOfferStatusUpdate(activeOffer.id, "REJECTED")}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 border border-red-500/30 transition-all cursor-pointer"
                    >
                      <LucideX className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active pending offers at this time.</p>
            )}
          </div>

          {/* Offer Input form */}
          {deal.stage !== "Closed" ? (
            <form onSubmit={handleSubmitOffer} className="space-y-4 pt-4 border-t border-white/5 text-xs">
              <h4 className="font-bold text-white">Propose New Offer / Counter</h4>
              <div>
                <label className="block text-muted-foreground mb-1">Offer Price ($ USD)</label>
                <input
                  type="number"
                  required
                  value={offerInput}
                  onChange={(e) => setOfferInput(e.target.value)}
                  placeholder="e.g. 245000"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Optional Note</label>
                <input
                  type="text"
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  placeholder="e.g. Willing to close within 14 days"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingOffer}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
              >
                Submit Price Offer
              </button>
            </form>
          ) : (
            <div className="p-4 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold rounded-xl text-center">
              Deal is CLOSED. Negotiation room is locked.
            </div>
          )}

          {/* Offers Timeline list */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <h4 className="font-bold text-white text-xs">Negotiation Timeline</h4>
            <div className="space-y-3">
              {offers.map((o) => (
                <div key={o.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{formatPrice(o.amount)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      By: {o.offered_by_id === user?.id ? "You" : opposingUser.name}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      o.status === "ACCEPTED" 
                        ? "bg-green-500/20 text-green-400 border border-green-500/20" 
                        : o.status === "REJECTED" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/20" 
                        : o.status === "COUNTERED" 
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" 
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Agreement & Digital Signatures Modal */}
      <AgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        dealId={Number(dealId)}
        onSuccess={fetchDealDetail}
      />
    </div>
  );
}
