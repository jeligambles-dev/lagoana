"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, MessageSquare, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Thread {
  id: string;
  adId: string;
  senderId: string;
  receiverId: string;
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

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "acum";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} z`;
  return format(date, "d MMM", { locale: ro });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Astazi";
  if (isYesterday(date)) return "Ieri";
  return format(date, "d MMMM yyyy", { locale: ro });
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const selectedThreadRef = useRef<Thread | null>(null);

  // Keep ref in sync for use in interval callbacks
  useEffect(() => {
    selectedThreadRef.current = selectedThread;
  }, [selectedThread]);

  // Load threads initially and poll every 10 seconds
  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadThreads().then(() => setLoading(false));
    const interval = setInterval(loadThreads, 10000);
    return () => clearInterval(interval);
  }, [loadThreads]);

  // Load messages for selected thread + poll every 5 seconds
  const loadMessages = useCallback(async () => {
    const thread = selectedThreadRef.current;
    if (!thread) return;
    try {
      const res = await fetch(`/api/messages?adId=${thread.adId}&otherUserId=${thread.otherUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!selectedThread) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedThread, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    // Only auto-scroll if user is near the bottom (within 150px)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Scroll to bottom immediately when opening a conversation
  useEffect(() => {
    if (selectedThread && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    }
  }, [selectedThread?.adId, selectedThread?.otherUser.id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || !session?.user) return;
    setSending(true);

    // Optimistic: add message to UI immediately
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      body: newMessage.trim(),
      createdAt: new Date().toISOString(),
      senderId: session.user.id!,
      status: "delivered",
      sender: { id: session.user.id!, name: session.user.name || "", avatarUrl: null },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    const msgText = newMessage;
    setNewMessage("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adId: selectedThread.adId,
        receiverId: selectedThread.otherUser.id,
        body: msgText,
      }),
    });

    if (res.ok) {
      // Refresh to get the real message with proper ID
      loadMessages();
      // Also refresh threads to update last message preview
      loadThreads();
    } else {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMessage(msgText); // Restore message text
    }
    setSending(false);
  }

  function handleSelectThread(thread: Thread) {
    setSelectedThread(thread);
    setMessages([]); // Clear old messages before loading new ones
    // Clear unread count locally for instant feedback
    setThreads((prev) =>
      prev.map((t) =>
        t.adId === thread.adId && t.otherUser.id === thread.otherUser.id
          ? { ...t, unreadCount: 0 }
          : t
      )
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
          <div className="w-full lg:w-80 shrink-0 border border-[#2A2A2A] rounded-xl overflow-hidden bg-[#0B0B0B]">
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
          <div className="hidden lg:flex flex-1 border border-[#2A2A2A] rounded-xl flex-col overflow-hidden bg-[#111111]">
            <div className="p-3 border-b border-[#2A2A2A] flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3">
              <div className="flex justify-start"><Skeleton className="h-10 w-48 rounded-2xl" /></div>
              <div className="flex justify-end"><Skeleton className="h-10 w-56 rounded-2xl" /></div>
              <div className="flex justify-start"><Skeleton className="h-10 w-40 rounded-2xl" /></div>
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
        <div className="text-center py-16 bg-[#111111] rounded-xl border border-[#2A2A2A]">
          <MessageSquare className="h-12 w-12 text-[#555] mx-auto mb-3" />
          <p className="text-[#888]">Nu ai niciun mesaj.</p>
          <p className="text-[#555] text-sm mt-1">Trimite un mesaj unui anunt pentru a incepe o conversatie.</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
          {/* Thread list */}
          <div
            className={`w-full lg:w-80 shrink-0 overflow-y-auto border border-[#2A2A2A] rounded-xl bg-[#0B0B0B] ${
              selectedThread ? "hidden lg:block" : ""
            }`}
          >
            {threads.map((thread) => {
              const isActive =
                selectedThread?.adId === thread.adId &&
                selectedThread?.otherUser.id === thread.otherUser.id;
              const hasUnread = thread.unreadCount > 0;

              return (
                <button
                  key={`${thread.adId}-${thread.otherUser.id}`}
                  onClick={() => handleSelectThread(thread)}
                  className={`w-full flex items-start gap-3 p-3 text-left border-b border-[#1E1E1E] transition-colors ${
                    isActive
                      ? "bg-[#1B3A2B]/30 border-l-2 border-l-[var(--color-gold)]"
                      : hasUnread
                      ? "bg-[#111111] hover:bg-[#1E1E1E]"
                      : "hover:bg-[#1E1E1E]"
                  }`}
                >
                  {/* Ad thumbnail */}
                  <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-[#1E1E1E]">
                    {thread.ad.images[0] ? (
                      <img
                        src={thread.ad.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-[#555]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${
                          hasUnread ? "font-semibold text-[#EDEDED]" : "font-medium text-[#AAAAAA]"
                        }`}
                      >
                        {thread.otherUser.name}
                      </span>
                      <span className="text-[10px] text-[#666] shrink-0">
                        {formatRelativeTime(thread.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-gold-dim)] truncate">{thread.ad.title}</p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${
                          hasUnread ? "text-[#CCCCCC] font-medium" : "text-[#666]"
                        }`}
                      >
                        {thread.senderId === session?.user?.id ? "Tu: " : ""}
                        {thread.body}
                      </p>
                      {hasUnread && (
                        <Badge className="bg-[var(--color-gold)] text-white text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center shrink-0">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Messages panel */}
          {selectedThread ? (
            <div className="flex-1 flex flex-col border border-[#2A2A2A] rounded-xl overflow-hidden bg-[#111111]">
              {/* Header with ad info */}
              <div className="p-3 border-b border-[#2A2A2A] bg-[#0B0B0B]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="lg:hidden text-[#888] hover:text-[#EDEDED] transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={selectedThread.otherUser.avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#1B3A2B] text-[var(--color-gold)] text-xs">
                      {selectedThread.otherUser.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#EDEDED]">{selectedThread.otherUser.name}</p>
                    <div className="flex items-center gap-2">
                      {selectedThread.otherUser.lastOnline && (
                        <span className="text-[10px]">
                          {isOnlineRecently(selectedThread.otherUser.lastOnline) ? (
                            <span className="text-green-400">online</span>
                          ) : (
                            <span className="text-[#666]">
                              activ{" "}
                              {formatDistanceToNow(new Date(selectedThread.otherUser.lastOnline), {
                                addSuffix: true,
                                locale: ro,
                              })}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ad preview bar */}
                <Link
                  href={`/anunturi/${selectedThread.ad.category.slug}/${selectedThread.ad.slug}`}
                  className="flex items-center gap-2.5 mt-2.5 p-2 rounded-lg bg-[#111111] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors"
                >
                  <div className="h-9 w-9 rounded-md overflow-hidden shrink-0 bg-[#1E1E1E]">
                    {selectedThread.ad.images[0] ? (
                      <img
                        src={selectedThread.ad.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-[#555]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-gold)] truncate">{selectedThread.ad.title}</p>
                </Link>
              </div>

              {/* Messages list */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0E0E0E]"
              >
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 text-[#555] animate-spin" />
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === session?.user?.id;
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const showDateSeparator =
                    !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));

                  // Group consecutive messages from same sender - add spacing between groups
                  const isSameSenderAsPrev = prevMsg && prevMsg.senderId === msg.senderId && !showDateSeparator;
                  const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
                  const isSameSenderAsNext =
                    nextMsg &&
                    nextMsg.senderId === msg.senderId &&
                    isSameDay(new Date(msg.createdAt), new Date(nextMsg.createdAt));

                  return (
                    <div key={msg.id}>
                      {/* Date separator */}
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <div className="h-px bg-[#2A2A2A] flex-1" />
                          <span className="text-[11px] text-[#666] px-3 bg-[#0E0E0E]">
                            {formatDateSeparator(msg.createdAt)}
                          </span>
                          <div className="h-px bg-[#2A2A2A] flex-1" />
                        </div>
                      )}

                      <div
                        className={`flex ${isMe ? "justify-end" : "justify-start"} ${
                          isSameSenderAsPrev ? "mt-0.5" : "mt-3"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-3.5 py-2 ${
                            isMe
                              ? "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] text-white"
                              : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#EDEDED]"
                          } ${
                            isMe
                              ? isSameSenderAsPrev && isSameSenderAsNext
                                ? "rounded-2xl rounded-r-md"
                                : isSameSenderAsPrev
                                ? "rounded-2xl rounded-tr-md rounded-br-lg"
                                : isSameSenderAsNext
                                ? "rounded-2xl rounded-br-md rounded-tr-lg"
                                : "rounded-2xl rounded-br-md"
                              : isSameSenderAsPrev && isSameSenderAsNext
                              ? "rounded-2xl rounded-l-md"
                              : isSameSenderAsPrev
                              ? "rounded-2xl rounded-tl-md rounded-bl-lg"
                              : isSameSenderAsNext
                              ? "rounded-2xl rounded-bl-md rounded-tl-lg"
                              : "rounded-2xl rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
                          {/* Show timestamp on last message in a group or standalone */}
                          {!isSameSenderAsNext && (
                            <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : ""}`}>
                              <span
                                className={`text-[10px] ${
                                  isMe ? "text-white/50" : "text-[#666]"
                                }`}
                              >
                                {format(new Date(msg.createdAt), "HH:mm")}
                              </span>
                              {isMe && (
                                <span
                                  className={`text-[10px] ${
                                    msg.status === "read" ? "text-white/70" : "text-white/30"
                                  }`}
                                >
                                  {msg.status === "read" ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-[#2A2A2A] bg-[#0B0B0B] flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="flex-1 bg-[#111111] border-[#2A2A2A] focus:border-[var(--color-gold)] text-[#EDEDED] placeholder:text-[#555]"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                  className="bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-white disabled:opacity-30"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center border border-[#2A2A2A] rounded-xl bg-[#111111]">
              <MessageSquare className="h-10 w-10 text-[#333] mb-3" />
              <p className="text-[#666]">Selecteaza o conversatie</p>
              <p className="text-[#444] text-sm mt-1">Alege un mesaj din lista din stanga</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isOnlineRecently(lastOnline: string): boolean {
  return Date.now() - new Date(lastOnline).getTime() < 5 * 60 * 1000;
}
