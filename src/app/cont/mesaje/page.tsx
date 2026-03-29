"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface Thread {
  id: string;
  adId: string;
  body: string;
  createdAt: string;
  ad: { id: string; title: string; slug: string; images: { url: string }[]; category: { slug: string } };
  otherUser: { id: string; name: string; avatarUrl: string | null; lastOnline: string | null };
  unreadCount: number;
}

interface Message {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  status?: "delivered" | "read";
  sender: { id: string; name: string; avatarUrl: string | null };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setThreads(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedThread) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function loadMessages() {
    if (!selectedThread) return;
    fetch(`/api/messages?adId=${selectedThread.adId}&otherUserId=${selectedThread.otherUser.id}`)
      .then((r) => r.json())
      .then(setMessages);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adId: selectedThread.adId,
        receiverId: selectedThread.otherUser.id,
        body: newMessage,
      }),
    });

    if (res.ok) {
      setNewMessage("");
      loadMessages();
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4 h-[600px]">
          {/* Thread list skeleton */}
          <div className="w-full lg:w-80 shrink-0 border border-[#2A2A2A] rounded-xl overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border-b border-[#1E1E1E]">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
          {/* Chat area skeleton */}
          <div className="hidden lg:flex flex-1 border border-[#2A2A2A] rounded-xl flex-col overflow-hidden">
            <div className="p-3 border-b border-[#2A2A2A] bg-[#111111] flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3 bg-[#111111]">
              <div className="flex justify-start"><Skeleton className="h-10 w-48 rounded-2xl" /></div>
              <div className="flex justify-end"><Skeleton className="h-10 w-56 rounded-2xl" /></div>
              <div className="flex justify-start"><Skeleton className="h-10 w-40 rounded-2xl" /></div>
            </div>
            <div className="p-3 border-t border-[#2A2A2A] bg-[#111111]">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#EDEDED]">Mesaje</h1>

      {threads.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl">
          <MessageSquare className="h-12 w-12 text-[#555] mx-auto mb-3" />
          <p className="text-[#888]">Nu ai niciun mesaj.</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[600px]">
          {/* Thread list */}
          <div className={`w-full lg:w-80 shrink-0 overflow-y-auto border border-[#2A2A2A] rounded-xl ${selectedThread ? "hidden lg:block" : ""}`}>
            {threads.map((thread) => (
              <button
                key={`${thread.adId}-${thread.otherUser.id}`}
                onClick={() => setSelectedThread(thread)}
                className={`w-full flex items-start gap-3 p-3 text-left hover:bg-[#1E1E1E] border-b border-[#1E1E1E] transition ${
                  selectedThread?.adId === thread.adId && selectedThread?.otherUser.id === thread.otherUser.id
                    ? "bg-[#1B3A2B]/30"
                    : ""
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={thread.otherUser.avatarUrl || undefined} />
                  <AvatarFallback className="bg-[#1B3A2B] text-gold text-sm">
                    {thread.otherUser.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{thread.otherUser.name}</span>
                    {thread.unreadCount > 0 && (
                      <Badge className="bg-gold text-white text-[10px] ml-1">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#888] truncate">{thread.ad.title}</p>
                  <p className="text-xs text-[#666] truncate mt-0.5">{thread.body}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Messages */}
          {selectedThread ? (
            <div className="flex-1 flex flex-col border border-[#2A2A2A] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-3 border-b border-[#2A2A2A] bg-[#111111] flex items-center gap-3">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="lg:hidden text-[#888]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedThread.otherUser.avatarUrl || undefined} />
                  <AvatarFallback className="bg-[#1B3A2B] text-gold text-xs">
                    {selectedThread.otherUser.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedThread.otherUser.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#888] truncate">{selectedThread.ad.title}</p>
                    {selectedThread.otherUser.lastOnline && (
                      <span className="text-[10px] text-[#666]">
                        {isOnlineRecently(selectedThread.otherUser.lastOnline)
                          ? <span className="text-green-400">online</span>
                          : `activ ${formatDistanceToNow(new Date(selectedThread.otherUser.lastOnline), { addSuffix: true, locale: ro })}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#111111]">
                {messages.map((msg) => {
                  const isMe = msg.senderId === session?.user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? "bg-gold text-white rounded-br-md"
                          : "bg-[#111111] border border-[#2A2A2A] rounded-bl-md"
                      }`}>
                        <p className="text-sm">{msg.body}</p>
                        <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : ""}`}>
                          <span className={`text-[10px] ${isMe ? "text-gold/50" : "text-[#666]"}`}>
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ro })}
                          </span>
                          {isMe && (
                            <span className={`text-[10px] ${msg.status === "read" ? "text-gold/70" : "text-gold/30"}`}>
                              {msg.status === "read" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-[#2A2A2A] bg-[#111111] flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                  className="bg-gold hover:bg-gold-light"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center border border-[#2A2A2A] rounded-xl">
              <p className="text-[#666]">Selecteaza o conversatie</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isOnlineRecently(lastOnline: string): boolean {
  return Date.now() - new Date(lastOnline).getTime() < 5 * 60 * 1000; // 5 minutes
}
