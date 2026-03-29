"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  function loadNotifications() {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      })
      .catch(() => {});
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative text-[#888] hover:text-gold" />}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-[#151515] border-[#2A2A2A] max-h-96 overflow-y-auto">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-[#EDEDED]">Notificari</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[10px] text-gold hover:text-gold-light transition">
              <Check className="h-3 w-3 inline mr-0.5" /> Marcheaza citite
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-[#666]">
            Nicio notificare.
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`px-3 py-2.5 cursor-pointer ${n.isRead ? "opacity-60" : ""}`}
              onClick={() => markRead(n.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {!n.isRead && <span className="w-2 h-2 bg-gold rounded-full shrink-0" />}
                  <span className="text-xs font-medium text-[#EDEDED] truncate">{n.title}</span>
                </div>
                <p className="text-[11px] text-[#888] mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-[#666] mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ro })}
                </p>
              </div>
              {n.link && (
                <Link href={n.link} className="shrink-0 ml-2 text-gold">
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
