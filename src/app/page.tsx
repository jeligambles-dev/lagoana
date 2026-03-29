export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdCard } from "@/components/ads/AdCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Crosshair,
  Target,
  Eye,
  Sword,
  Shirt,
  Settings,
  Dog,
  MapPin,
  ArrowRight,
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "arme-de-foc": Crosshair,
  munitie: Target,
  optica: Eye,
  "cutite-unelte": Sword,
  "arcuri-arbalete": Target,
  echipament: Shirt,
  "accesorii-arme": Settings,
  "caini-vanatoare": Dog,
  servicii: MapPin,
};

async function getSpotlightAds() {
  return prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      spotlightUntil: { gt: new Date() },
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

async function getRecentAds() {
  return prisma.ad.findMany({
    where: { status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { position: "asc" },
  });
}

export default async function HomePage() {
  const [spotlightAds, recentAds, categories] = await Promise.all([
    getSpotlightAds(),
    getRecentAds(),
    getCategories(),
  ]);

  const displaySpotlight = spotlightAds.length > 0 ? spotlightAds : recentAds.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[#EDEDED]">
            Piata ta de <span className="text-gold">vanatoare</span>
          </h1>
          <p className="text-[#888] text-lg mb-8 max-w-2xl mx-auto">
            Cumpara si vinde echipament de vanatoare. Publicare gratuita, simplu si rapid.
          </p>
          <form action="/anunturi" method="get" className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666]" />
              <Input
                name="q"
                type="search"
                placeholder="Ce cauti? (ex: luneta, cutit, arma)"
                className="h-14 pl-12 pr-4 text-lg bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] rounded-xl focus:border-gold placeholder:text-[#555]"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Target;
              return (
                <Link
                  key={cat.id}
                  href={`/anunturi?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1B3A2B]/30 transition group"
                >
                  <div className="w-12 h-12 bg-[#1B3A2B] rounded-full flex items-center justify-center group-hover:bg-[#1B3A2B]/80 transition">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <span className="text-xs text-center text-[#EDEDED]/70 font-medium leading-tight group-hover:text-gold transition">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spotlight */}
      {displaySpotlight.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#EDEDED]">Anunturi in spotlight</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {displaySpotlight.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </section>
      )}

      {/* Recent ads */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#EDEDED]">Anunturi recente</h2>
          <Button render={<Link href="/anunturi" />} variant="ghost" className="text-gold hover:text-gold-light">
              Vezi toate
              <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        {recentAds.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#111111] rounded-xl border border-[#2A2A2A]">
            <p className="text-[#888] mb-4">Inca nu exista anunturi. Fii primul care publica!</p>
            <Button render={<Link href="/publica" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
              Publica primul anunt
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
