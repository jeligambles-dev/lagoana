"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Acasa" },
  { href: "/anunturi", icon: Search, label: "Cauta" },
  { href: "/publica", icon: Plus, label: "Publica", highlight: true },
  { href: "/cont/mesaje", icon: MessageSquare, label: "Mesaje", auth: true },
  { href: "/cont/profil", icon: User, label: "Cont", auth: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0B] border-t border-[#2A2A2A] safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          if (item.auth && !session) {
            return (
              <Link
                key={item.href}
                href="/cont/autentificare"
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#555]"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          }

          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={session ? item.href : "/cont/autentificare"}
                className="flex flex-col items-center gap-0.5 -mt-3"
              >
                <div className="bg-gold text-[#0B0B0B] rounded-full p-3 shadow-lg shadow-gold/20">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] text-gold font-medium">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1",
                isActive ? "text-gold" : "text-[#666]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
