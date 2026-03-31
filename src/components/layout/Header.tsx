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
  FileText,
  ChevronDown,
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
      // Hysteresis: scroll down past 150 to collapse, scroll up past 50 to expand
      // Prevents flickering at the threshold
      setScrolled((prev) => {
        if (prev) return window.scrollY > 50;
        return window.scrollY > 150;
      });
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
      {/* Main header - Logo + Search + CTA (desktop only, hidden when scrolled) */}
      {!scrolled && (
        <div className="hidden sm:block bg-[#0F1111]">
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
      )}

      {/* Compact sticky bar - categories + account links (desktop only) */}
      <div className={`hidden sm:block transition-all duration-300 ${scrolled ? "bg-[#0F1111]" : "bg-[#1B3A2B]"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className={`flex items-center transition-all duration-300 ${scrolled ? "h-24" : "h-10"}`}>
            {/* Logo - visible when scrolled */}
            <Link href="/" className={`shrink-0 transition-all duration-300 overflow-hidden ${scrolled ? "opacity-100 w-24 mr-4" : "opacity-0 w-0 mr-0"}`}>
              <Image src="/logo.png" alt="Lagoana" width={200} height={200} className="h-20 w-20" />
            </Link>

            {/* Category links */}
            <div className="flex items-center gap-1 shrink-0">
              <NavLink href="/anunturi?category=arme-de-foc" icon={Crosshair}>Arme de foc</NavLink>
              <NavLink href="/anunturi?category=munitie" icon={Target}>Munitie</NavLink>
              <NavLink href="/anunturi?category=optica" icon={Eye}>Optica</NavLink>
              <NavLink href="/anunturi?category=cutite-unelte" icon={Settings}>Cutite & Unelte</NavLink>
              <NavLink href="/anunturi?category=echipament" icon={Shirt}>Echipament</NavLink>
              <NavLink href="/anunturi?category=accesorii-arme" icon={Settings}>Accesorii</NavLink>
              <NavLink href="/anunturi">Toate categoriile</NavLink>
            </div>

            {/* Spacer */}
            <div className="flex-1 min-w-0" />

            {/* Account dropdown / auth links */}
            <div className="flex items-center gap-3 text-xs shrink-0 ml-4">
              {session ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-[#EDEDED]/70 hover:text-gold transition text-xs cursor-pointer outline-none">
                      <User className="h-3.5 w-3.5" />
                      {session.user.name || "Contul meu"}
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#151515] border-[#2A2A2A]">
                      <DropdownMenuItem render={<Link href="/cont/profil" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <User className="h-4 w-4 mr-2" /> Profilul meu
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/cont/anunturile-mele" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                        <FileText className="h-4 w-4 mr-2" /> Anunturile mele
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
                </div>
              ) : (
                <>
                  <Link href="/cont/autentificare" className="text-[#EDEDED]/70 hover:text-gold transition flex items-center gap-1">
                    <LogOut className="h-3 w-3" /> Autentificare
                  </Link>
                  <Link href="/cont/inregistrare" className="text-gold hover:text-gold-light transition font-medium flex items-center gap-1">
                    <User className="h-3 w-3" /> Inregistrare
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile: logo + search bar */}
      <div className="sm:hidden bg-[#0F1111] border-b border-[#2A2A2A] px-4 py-2 flex items-center gap-3">
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="Lagoana" width={200} height={200} className="h-28 w-28" />
        </Link>
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
