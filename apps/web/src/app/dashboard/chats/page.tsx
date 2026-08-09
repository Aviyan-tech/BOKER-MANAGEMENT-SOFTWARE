"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { LucideSend, LucideUser, LucideCircle, LucideMessageSquare, LucideLoader2, LucideBadgeAlert, LucideCheckCircle2, LucideXCircle } from "lucide-react";

interface Agent {
  id: number | string; // string for dummy sellers
  name: string;
  email: string;
  avatar_url?: string;
  is_online: boolean;
  isSeller?: boolean;
  listingId?: string;
  status?: string;
  propertyTitle?: string;
}

interface Message {
  id: number | string;
  sender_id: number | string;
  receiver_id: number | string;
  content: string;
  created_at: string;
}

function AgentChatsContent() {
  const { user, accessToken, fetchWithAuth } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);
  const [otherAgentTyping, setOtherAgentTyping] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  // Load all agents from the platform
  const loadAgents = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/admin/agents`);
      if (res.ok) {
        const data = await res.json();
        // Exclude current user
        const fetched = data.filter((a: Agent) => a.id !== user?.id);
        setAgents(fetched);
        return fetched;
      }
    } catch (err) {
      console.error("Error loading agents:", err);
    }
    return [];
  };

  // Load messages with selected agent
  const loadMessages = async (agent: Agent) => {
    if (agent.isSeller) {
      // Load from dummy local storage
      const chatsStr = localStorage.getItem("seller_chats");
      const chats = chatsStr ? JSON.parse(chatsStr) : {};
      setMessages(chats[agent.listingId!] || []);
    } else {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/v1/messages?with_user_id=${agent.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    }
  };

  const loadDummySellers = (currentAgents: Agent[]) => {
    try {
      const stateStr = localStorage.getItem("seller_listings_state");
      if (stateStr) {
        const listings = JSON.parse(stateStr);
        const activeListings = listings.filter((l: any) => l.requestStatus === "Pending" || l.requestStatus === "Accepted" || l.requestStatus === "Declined");
        
        const sellerAgents: Agent[] = activeListings.map((l: any) => ({
          id: `seller_${l.id}`,
          name: `Owner: ${l.title}`,
          email: l.location,
          is_online: false,
          isSeller: true,
          listingId: l.id,
          status: l.requestStatus,
          propertyTitle: l.title
        }));

        const allAgents = [...sellerAgents, ...currentAgents];
        setAgents(allAgents);

        // Auto select if query param present
        const qSellerId = searchParams.get("sellerId");
        if (qSellerId) {
          const target = allAgents.find(a => a.listingId === qSellerId);
          if (target) setSelectedAgent(target);
        }
      }
    } catch(e) {}
  };

  useEffect(() => {
    if (user && user.role !== "CUSTOMER") {
      loadAgents().then((fetched) => {
        loadDummySellers(fetched || []);
      });
    }
  }, [user, searchParams]);

  // Connect WebSocket
  useEffect(() => {
    if (!accessToken) return;

    const socket = new WebSocket(`${WS_URL}/ws/chat?token=${accessToken}`);
    ws.current = socket;

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const { event: wsEvent, data } = payload;

      if (wsEvent === "chat:message") {
        // Append if it belongs to selected conversation
        if (
          selectedAgent &&
          ((data.sender_id === user?.id && data.receiver_id === selectedAgent.id) ||
            (data.sender_id === selectedAgent.id && data.receiver_id === user?.id)) &&
          !data.deal_id
        ) {
          setMessages((prev) => [...prev, data]);
        }
      } else if (wsEvent === "chat:typing") {
        if (selectedAgent && data.sender_id === selectedAgent.id && !data.deal_id) {
          setOtherAgentTyping(data.is_typing);
        }
      } else if (wsEvent === "presence:online") {
        setAgents((prev) =>
          prev.map((a) => (a.id === data.user_id ? { ...a, is_online: true } : a))
        );
        if (selectedAgent?.id === data.user_id) {
          setSelectedAgent((prev) => (prev ? { ...prev, is_online: true } : null));
        }
      } else if (wsEvent === "presence:offline") {
        setAgents((prev) =>
          prev.map((a) => (a.id === data.user_id ? { ...a, is_online: false } : a))
        );
        if (selectedAgent?.id === data.user_id) {
          setSelectedAgent((prev) => (prev ? { ...prev, is_online: false } : null));
        }
      }
    };

    socket.onclose = () => {
      console.log("WebSocket chat disconnected");
    };

    return () => {
      socket.close();
    };
  }, [accessToken, selectedAgent, user]);

  useEffect(() => {
    if (selectedAgent) {
      loadMessages(selectedAgent);
      setOtherAgentTyping(false);
    }
  }, [selectedAgent]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherAgentTyping]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedAgent) return;

    if (selectedAgent.isSeller) {
      // Mock sending message to localStorage
      const newMessage = {
        id: Date.now(),
        sender_id: user?.id || 0,
        receiver_id: Number(selectedAgent.id) || 0,
        content: inputText,
        created_at: new Date().toISOString()
      };
      
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      setInputText("");

      const chatsStr = localStorage.getItem("seller_chats");
      const chats = chatsStr ? JSON.parse(chatsStr) : {};
      chats[selectedAgent.listingId!] = newMessages;
      localStorage.setItem("seller_chats", JSON.stringify(chats));

      // Simulate seller reply if pending
      if (selectedAgent.status === "Pending") {
        setOtherAgentTyping(true);
        setTimeout(() => {
          setOtherAgentTyping(false);
          const reply = {
            id: Date.now() + 1,
            sender_id: Number(selectedAgent.id) || 0,
            receiver_id: user?.id || 0,
            content: "Thanks for reaching out! Let's discuss your broker fee.",
            created_at: new Date().toISOString()
          };
          setMessages(prev => {
            const updated = [...prev, reply];
            chats[selectedAgent.listingId!] = updated;
            localStorage.setItem("seller_chats", JSON.stringify(chats));
            return updated;
          });
        }, 2000);
      }
      return;
    }

    if (!ws.current) return;
    const payload = {
      event: "chat:message",
      data: {
        receiver_id: selectedAgent.id,
        content: inputText,
      },
    };

    ws.current.send(jsonPayload(payload));
    
    // Stop typing
    sendTypingStatus(false);
    setInputText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (!typing) {
      setTyping(true);
      sendTypingStatus(true);
    }

    // Debounce typing status
    const timer = setTimeout(() => {
      setTyping(false);
      sendTypingStatus(false);
    }, 2000);

    return () => clearTimeout(timer);
  };

  const sendTypingStatus = (status: boolean) => {
    if (!selectedAgent || selectedAgent.isSeller || !ws.current) return;
    ws.current.send(
      jsonPayload({
        event: "chat:typing",
        data: {
          receiver_id: selectedAgent.id,
          is_typing: status,
        },
      })
    );
  };

  const handleSellerAction = (action: "Accepted" | "Declined") => {
    if (!selectedAgent || !selectedAgent.isSeller) return;
    
    const stateStr = localStorage.getItem("seller_listings_state");
    if (stateStr) {
      const listings = JSON.parse(stateStr);
      const updated = listings.map((l: any) => l.id === selectedAgent.listingId ? { ...l, requestStatus: action } : l);
      localStorage.setItem("seller_listings_state", JSON.stringify(updated));
      
      // Update local state
      setSelectedAgent({ ...selectedAgent, status: action });
      setAgents(prev => prev.map(a => a.id === selectedAgent.id ? { ...a, status: action } : a));
    }
  };

  const jsonPayload = (obj: any) => {
    return JSON.stringify(obj);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex gap-6 h-[80vh] overflow-hidden">
        {/* Left Side: Agents Inbox List */}
        <div className="w-1/3 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <LucideMessageSquare className="h-5 w-5 text-primary" />
              Inbox &amp; Negotiations
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {agents.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No other active agents found.</p>
            ) : (
              agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    selectedAgent?.id === agent.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-white/5"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={agent.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${agent.name}`}
                      alt={agent.name}
                      className="h-10 w-10 rounded-full border border-white/10"
                    />
                    <span className="absolute bottom-0 right-0">
                      <LucideCircle
                        className={`h-3 w-3 rounded-full border border-black ${
                          agent.is_online ? "fill-green-400 text-green-400" : "fill-neutral-600 text-neutral-600"
                        }`}
                      />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      {agent.name}
                      {agent.isSeller && (
                        <span className="bg-orange-500/20 text-orange-400 text-[8px] uppercase px-1.5 py-0.5 rounded border border-orange-500/30">
                          Seller
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{agent.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Message Pane */}
        <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
          {selectedAgent ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAgent.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedAgent.name}`}
                      alt={selectedAgent.name}
                      className="h-10 w-10 rounded-full border border-white/10"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{selectedAgent.name}</h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {!selectedAgent.isSeller && (
                          <LucideCircle
                            className={`h-2 w-2 rounded-full ${
                              selectedAgent.is_online ? "fill-green-400 text-green-400" : "fill-neutral-600 text-neutral-600"
                            }`}
                          />
                        )}
                        {selectedAgent.isSeller ? selectedAgent.email : (selectedAgent.is_online ? "Online" : "Offline")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seller Negotiation Bar */}
                {selectedAgent.isSeller && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <LucideBadgeAlert className="h-4 w-4 text-orange-400" />
                      <span className="text-xs font-semibold text-white">Negotiating Representation: <span className="text-orange-300">{selectedAgent.propertyTitle}</span></span>
                    </div>
                    
                    {selectedAgent.status === "Pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleSellerAction("Accepted")} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                          <LucideCheckCircle2 className="h-3 w-3" /> Mark Accepted
                        </button>
                        <button onClick={() => handleSellerAction("Declined")} className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                          <LucideXCircle className="h-3 w-3" /> Mark Declined
                        </button>
                      </div>
                    )}
                    {selectedAgent.status === "Accepted" && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-emerald-500/30">
                        Representation Accepted
                      </span>
                    )}
                    {selectedAgent.status === "Declined" && (
                      <span className="bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-red-500/30">
                        Representation Declined
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message display */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id || msg.sender_id === "me";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 text-sm ${
                          isMe
                            ? "bg-primary text-white rounded-tr-none shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                            : "bg-white/5 text-neutral-200 rounded-tl-none border border-white/5"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <span className="block text-[9px] text-white/50 text-right mt-1.5">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {otherAgentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 text-muted-foreground rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1">
                      <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <LucideMessageSquare className="h-12 w-12 text-neutral-600 mb-2" />
              <p className="text-sm">Select an agent from the list to start messaging.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AgentChatsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><LucideLoader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
      <AgentChatsContent />
    </Suspense>
  );
}
