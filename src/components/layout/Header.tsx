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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/anunturi?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - utility links */}
      <div className="bg-[#0B0B0B] border-b border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between text-xs">
          <span className="text-[#888]">Piata ta de echipament de vanatoare</span>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/cont/mesaje" className="text-[#888] hover:text-gold transition flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Mesaje
                </Link>
                <Link href="/cont/favorite" className="text-[#888] hover:text-gold transition flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Favorite
                </Link>
                <Link href="/cont/cautari-salvate" className="text-[#888] hover:text-gold transition flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Cautari salvate
                </Link>
                <NotificationBell />
                <Link href="/cont/profil" className="text-[#888] hover:text-gold transition flex items-center gap-1">
                  <User className="h-3 w-3" /> {session.user.name || "Contul meu"}
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="text-gold/70 hover:text-gold transition flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[#888] hover:text-gold transition flex items-center gap-1">
                  <LogOut className="h-3 w-3" /> Iesire
                </button>
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

      {/* Main header - Logo + Search + CTA */}
      <div className="bg-[#0F1111]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          {/* Logo - large and prominent */}
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

          {/* Center: Search with autocomplete */}
          <SearchAutocomplete />

          {/* Right: CTA button */}
          <div className="hidden sm:flex flex-col items-center gap-2">
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

      {/* Bottom nav - category links */}
      <div className="bg-[#1B3A2B] hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 h-10 overflow-x-auto">
            <NavLink href="/anunturi?category=arme-de-foc" icon={Crosshair}>Arme de foc</NavLink>
            <NavLink href="/anunturi?category=munitie" icon={Target}>Munitie</NavLink>
            <NavLink href="/anunturi?category=optica" icon={Eye}>Optica</NavLink>
            <NavLink href="/anunturi?category=cutite-unelte" icon={Settings}>Cutite & Unelte</NavLink>
            <NavLink href="/anunturi?category=echipament" icon={Shirt}>Echipament</NavLink>
            <NavLink href="/anunturi?category=accesorii-arme" icon={Settings}>Accesorii</NavLink>
            <NavLink href="/anunturi">Toate categoriile</NavLink>
          </nav>
        </div>
      </div>

      {/* Mobile user menu (dropdown) */}
      <div className="sm:hidden bg-[#0F1111] border-b border-[#2A2A2A] px-4 pb-2 flex items-center gap-2">
        <Button render={<Link href="/publica" />} className="flex-1 bg-gold text-[#0B0B0B] hover:bg-gold-light font-bold h-10">
          <Plus className="h-4 w-4 mr-1" />
          Publica anunt
        </Button>
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="border-[#2A2A2A] h-10 w-10" />}>
              <Avatar className="h-7 w-7">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-[#1B3A2B] text-gold text-xs">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#151515] border-[#2A2A2A]">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-[#EDEDED]">{session.user.name}</p>
                <p className="text-xs text-[#888]">{session.user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
              <DropdownMenuItem render={<Link href="/cont/profil" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                <User className="h-4 w-4 mr-2" /> Profilul meu
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/cont/anunturile-mele" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                <Settings className="h-4 w-4 mr-2" /> Anunturile mele
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/cont/favorite" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                <Heart className="h-4 w-4 mr-2" /> Favorite
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/cont/mesaje" />} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                <MessageSquare className="h-4 w-4 mr-2" /> Mesaje
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-[#EDEDED] focus:bg-[#1B3A2B] focus:text-gold">
                <LogOut className="h-4 w-4 mr-2" /> Deconectare
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button render={<Link href="/cont/autentificare" />} variant="outline" className="border-gold text-gold hover:bg-gold hover:text-[#0B0B0B] h-10">
            Autentificare
          </Button>
        )}
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
