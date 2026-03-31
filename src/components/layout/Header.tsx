"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { NotificationBell } from "./NotificationBell";
import { SearchAutocomplete } from "./SearchAutocomplete";
import {
  Plus,
  User,
  LogOut,
  Heart,
  MessageSquare,
  Settings,
  ShieldCheck,
  Store,
  Bell,
  FileText,
  FileEdit,
  ChevronDown,
  Crosshair,
  Target,
  Eye,
  Shirt,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  // 0 = top (fully expanded), 1 = fully compact
  const [shrink, setShrink] = useState(0);

  useEffect(() => {
    function onScroll() {
      // Smoothly interpolate between 0 and 1 based on scroll position
      // Full transition happens over 200px of scroll
      const progress = Math.min(1, Math.max(0, window.scrollY / 200));
      setShrink(progress);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Set initial state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Interpolated values
  const isCompact = shrink > 0.5;
  const logoSize = Math.round(80 - shrink * 20); // 80px -> 60px
  const headerPadding = Math.round(12 - shrink * 8); // 12px -> 4px
  const showCta = shrink < 0.3;
  const showSearch = shrink < 0.7;

  return (
    <header className="sticky top-0 z-50 bg-[#0F1111]">
      {/* Desktop: single unified header */}
      <div className="hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main row: logo + search + CTA + account */}
          <div
            className="flex items-center gap-4 transition-all duration-200 ease-out"
            style={{ paddingTop: `${headerPadding}px`, paddingBottom: `${headerPadding}px` }}
          >
            {/* Logo - smoothly shrinks */}
            <Link href="/" className="shrink-0 transition-all duration-200">
              <Image
                src="/logo.png"
                alt="Lagoana"
                width={200}
                height={200}
                className="transition-all duration-200"
                style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                priority
              />
            </Link>

            {/* Search - always visible */}
            <div className="flex-1 min-w-0">
              <SearchAutocomplete />
            </div>

            {/* CTA - fades out on scroll */}
            <div
              className="shrink-0 transition-all duration-200 overflow-hidden"
              style={{
                opacity: showCta ? 1 : 0,
                width: showCta ? "auto" : "0px",
                pointerEvents: showCta ? "auto" : "none",
              }}
            >
              <Button render={<Link href="/publica" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-bold text-sm h-10 px-5 whitespace-nowrap">
                <Plus className="h-4 w-4 mr-1.5" />
                Publica anunt
              </Button>
            </div>

            {/* Account dropdown / auth links */}
            <div className="flex items-center gap-2 text-xs shrink-0">
              {session ? (
                <>
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-[#EDEDED]/70 hover:text-gold transition text-xs cursor-pointer outline-none">
                      <User className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">{session.user.name || "Contul meu"}</span>
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#151515] border-[#2A2A2A]">
                      <DropdownMenuItem render={<Link href="/cont/profil" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <User className="h-4 w-4 mr-2" /> Profilul meu
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/cont/anunturile-mele" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <FileText className="h-4 w-4 mr-2" /> Anunturile mele
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/cont/ciorne" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <FileEdit className="h-4 w-4 mr-2" /> Ciorne
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                      <DropdownMenuItem render={<Link href="/cont/mesaje" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <MessageSquare className="h-4 w-4 mr-2" /> Mesaje
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/cont/favorite" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <Heart className="h-4 w-4 mr-2" /> Favorite
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/cont/cautari-salvate" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <Bell className="h-4 w-4 mr-2" /> Cautari salvate
                      </DropdownMenuItem>
                      {session.user.role === "ADMIN" && (
                        <>
                          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                          <DropdownMenuItem render={<Link href="/admin" />} className="text-gold focus:bg-[#1B3A2B] focus:text-gold">
                            <ShieldCheck className="h-4 w-4 mr-2" /> Admin
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <LogOut className="h-4 w-4 mr-2" /> Deconectare
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/cont/autentificare" className="text-[#EDEDED]/70 hover:text-gold transition flex items-center gap-1">
                    <User className="h-3 w-3" /> Autentificare
                  </Link>
                  <Link href="/cont/inregistrare" className="text-gold hover:text-gold-light transition font-medium flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Inregistrare
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Categories row */}
          <nav className="flex items-center h-9 border-t border-[#1B3A2B]/50">
            <div className="flex items-center gap-1">
              <NavLink href="/anunturi/categorie/arme-de-foc" icon={Crosshair}>Arme de foc</NavLink>
              <NavLink href="/anunturi/categorie/munitie" icon={Target}>Munitie</NavLink>
              <NavLink href="/anunturi/categorie/optica" icon={Eye}>Optica</NavLink>
              <NavLink href="/anunturi/categorie/cutite-unelte" icon={Settings}>Cutite & Unelte</NavLink>
              <NavLink href="/anunturi/categorie/echipament" icon={Shirt}>Echipament</NavLink>
              <NavLink href="/anunturi/categorie/accesorii-arme" icon={Settings}>Accesorii</NavLink>
              <NavLink href="/anunturi">Toate categoriile</NavLink>
            </div>
            <div className="flex-1" />
            <Link href="/armurieri" className="text-xs text-[#888] hover:text-gold transition flex items-center gap-1 px-2">
              <Store className="h-3 w-3" /> Armurieri
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile: logo + search bar */}
      <div className="sm:hidden px-4 py-2 flex items-center gap-3">
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="Lagoana" width={200} height={200} className="h-14 w-14" />
        </Link>
        <div className="flex-1 min-w-0">
          <SearchAutocomplete />
        </div>
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
