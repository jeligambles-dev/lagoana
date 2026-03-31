export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { AdCard } from "@/components/ads/AdCard";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/home/HeroSlider";
import {
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

async function getBanners() {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { position: "asc" },
    select: { id: true, title: true, imageUrl: true, linkUrl: true, company: true },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { position: "asc" },
  });
}

export default async function HomePage() {
  const [spotlightAds, recentAds, categories, banners] = await Promise.all([
    getSpotlightAds(),
    getRecentAds(),
    getCategories(),
    getBanners(),
  ]);

  const displaySpotlight = spotlightAds.length > 0 ? spotlightAds : recentAds.slice(0, 4);

  return (
    <div>
      {/* Hero Banner Slider */}
      <HeroSlider banners={banners} />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 mt-6 sm:mt-8 relative z-10">
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
                  {cat.imageUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                      <Image src={cat.imageUrl} alt={cat.name} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-[#1B3A2B] rounded-full flex items-center justify-center group-hover:bg-[#1B3A2B]/80 transition">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                  )}
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
