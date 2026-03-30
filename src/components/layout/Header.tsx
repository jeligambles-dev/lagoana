"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { NotificationBell } from "./NotificationBell";
import { SearchAutocomplete } from "./SearchAutocomplete";
import {
  Search,
  Plus,
  User,
  LogOut,
  Heart,
  MessageSquare,
  Settings,
  ShieldCheck,
  Store,
  Bell,
  Crosshair,
  Target,
  Eye,
  Shirt,
} from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/anunturi?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Full header - hidden on mobile entirely, collapses on scroll on desktop */}
      <div className={`hidden sm:block transition-all duration-300 overflow-hidden ${scrolled ? "max-h-0" : "max-h-[400px]"}`}>
        {/* Top bar - utility links (desktop only, before scroll) */}
        <div className="bg-[#0B0B0B] border-b border-[#1E1E1E]">
          <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between text-xs">
            <span className="text-[#888]">Piata ta de echipament de vanatoare</span>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin" className="text-gold/70 hover:text-gold transition flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/cont/autentificare" className="text-[#888] hover:text-gold transition">Autentificare</Link>
                  <Link href="/cont/inregistrare" className="text-gold hover:text-gold-light transition font-medium">Inregistrare</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main header - Logo + Search + CTA (desktop only, before scroll) */}
        <div className="bg-[#0F1111]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.png"
                alt="Lagoana"
                width={500}
                height={500}
                className="h-44 w-44 sm:h-56 sm:w-56"
                priority
              />
            </Link>
            <SearchAutocomplete />
            <div className="flex flex-col items-center gap-2">
              <Button render={<Link href="/publica" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-bold text-base h-12 px-6">
                <Plus className="h-5 w-5 mr-1.5" />
                Publica anunt
              </Button>
              <Link href="/armurieri" className="text-xs text-[#888] hover:text-gold transition flex items-center gap-1">
                <Store className="h-3 w-3" /> Armurieri autorizati
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Compact sticky bar - categories + account links (desktop only) */}
      <div className="bg-[#1B3A2B] hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center h-10 overflow-x-auto">
            {/* Logo mini - only visible when scrolled */}
            <Link href="/" className={`shrink-0 mr-2 transition-all duration-300 ${scrolled ? "opacity-100 w-8" : "opacity-0 w-0"}`}>
              <Image src="/logo.png" alt="Lagoana" width={32} height={32} className="h-8 w-8" />
            </Link>

            {/* Category links */}
            <div className="flex items-center gap-1">
              <NavLink href="/anunturi?category=arme-de-foc" icon={Crosshair}>Arme de foc</NavLink>
              <NavLink href="/anunturi?category=munitie" icon={Target}>Munitie</NavLink>
              <NavLink href="/anunturi?category=optica" icon={Eye}>Optica</NavLink>
              <NavLink href="/anunturi?category=cutite-unelte" icon={Settings}>Cutite & Unelte</NavLink>
              <NavLink href="/anunturi?category=echipament" icon={Shirt}>Echipament</NavLink>
              <NavLink href="/anunturi?category=accesorii-arme" icon={Settings}>Accesorii</NavLink>
              <NavLink href="/anunturi">Toate categoriile</NavLink>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Account links - next to categories */}
            <div className="flex items-center gap-3 text-xs shrink-0 ml-4">
              {session ? (
                <>
                  <Link href="/cont/mesaje" className="text-[#EDEDED]/70 hover:text-gold transition flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Mesaje
                  </Link>
                  <Link href="/cont/favorite" className="text-[#EDEDED]/70 hover:text-gold transition flex items-center gap-1">
                    <Heart className="h-3 w-3" /> Favorite
                  </Link>
                  <Link href="/cont/cautari-salvate" className="text-[#EDEDED]/70 hover:text-gold transition flex items-center gap-1">
                    <Bell className="h-3 w-3" /> Cautari salvate
                  </Link>
                  <NotificationBell />
                  <Link href="/cont/profil" className="text-[#EDEDED]/70 hover:text-gold transition flex items-center gap-1">
                    <User className="h-3 w-3" /> {session.user.name || "Contul meu"}
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[#EDEDED]/70 hover:text-gold transition flex items-center gap-1">
                    <LogOut className="h-3 w-3" /> Iesire
                  </button>
                </>
              ) : (
                <>
                  <Link href="/cont/autentificare" className="text-[#EDEDED]/70 hover:text-gold transition">Autentificare</Link>
                  <Link href="/cont/inregistrare" className="text-gold hover:text-gold-light transition font-medium">Inregistrare</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile: only search bar, no logo/header */}
      <div className="sm:hidden bg-[#0F1111] border-b border-[#2A2A2A] px-4 py-2">
        <SearchAutocomplete />
      </div>
    </header>
  );
}

function NavLink({ href, icon: Icon, children }: { href: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 h-full text-sm text-[#EDEDED]/80 hover:text-gold hover:bg-[#EDEDED]/5 transition whitespace-nowrap"
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </Link>
  );
}
