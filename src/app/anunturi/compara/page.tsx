"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Clock, ChevronLeft, ChevronRight, ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";

interface CompareAd {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  currency: string;
  isNegotiable: boolean;
  condition: string;
  county: string;
  city: string;
  description: string;
  createdAt: string;
  category: { slug: string; name: string };
  images: { url: string; thumbnailUrl: string | null }[];
  user: { id: string; name: string | null; avatarUrl: string | null };
}

const conditionLabels: Record<string, string> = {
  NEW: "Nou",
  USED: "Folosit",
  LIKE_NEW: "Ca nou",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>}>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<CompareAd[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const idsParam = searchParams.get("ids") || "";

  useEffect(() => {
    if (!idsParam) {
      setLoading(false);
      return;
    }

    fetch(`/api/ads/compare?ids=${idsParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAds(data);
      })
      .finally(() => setLoading(false));
  }, [idsParam]);

  const cheapestPrice = ads.reduce<number | null>((min, ad) => {
    if (ad.price == null) return min;
    if (min == null) return ad.price;
    return ad.price < min ? ad.price : min;
  }, null);

  function scrollTo(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#1A1A1A] rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-[#1A1A1A] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ads.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-[#888] text-lg">Selecteaza cel putin 2 anunturi pentru comparatie.</p>
        <Link href="/anunturi" className="text-gold hover:underline mt-4 inline-block">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Inapoi la anunturi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/anunturi" className="text-sm text-[#888] hover:text-gold flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Inapoi la anunturi
          </Link>
          <h1 className="text-2xl font-bold text-[#EDEDED]">Comparatie anunturi</h1>
        </div>
        {/* Mobile scroll arrows */}
        <div className="flex gap-2 sm:hidden">
          <button onClick={() => scrollTo("left")} className="p-2 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
            <ChevronLeft className="h-4 w-4 text-[#EDEDED]" />
          </button>
          <button onClick={() => scrollTo("right")} className="p-2 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
            <ChevronRight className="h-4 w-4 text-[#EDEDED]" />
          </button>
        </div>
      </div>

      {/* Comparison grid - horizontal scroll on mobile */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:overflow-visible"
        style={{ gridTemplateColumns: `repeat(${ads.length}, minmax(0, 1fr))` }}
      >
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="min-w-[80vw] sm:min-w-0 snap-center bg-[#111111] rounded-lg border border-[#2A2A2A] overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-[#1A1A1A]">
              {ad.images[0] ? (
                <Image
                  src={ad.images[0].thumbnailUrl || ad.images[0].url}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#444]">
                  Fara imagine
                </div>
              )}
              {ad.images.length > 1 && (
                <span className="absolute bottom-2 right-2 text-[10px] bg-[#0B0B0B]/70 text-[#EDEDED] px-1.5 py-0.5 rounded backdrop-blur-sm">
                  {ad.images.length} poze
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#666] block mb-1">Titlu</span>
                <Link
                  href={`/anunturi/${ad.category.slug}/${ad.slug}`}
                  className="font-semibold text-[#EDEDED] hover:text-gold transition-colors line-clamp-2"
                >
                  {ad.title}
                </Link>
              </div>

              {/* Price */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#666] block mb-1">Pret</span>
                <span
                  className={`text-xl font-bold ${
                    ad.price != null && ad.price === cheapestPrice
                      ? "text-green-400"
                      : "text-gold"
                  }`}
                >
                  {ad.price != null
                    ? `${ad.price.toLocaleString("ro-RO")} ${ad.currency}`
                    : "Pret la cerere"}
                </span>
                {ad.price != null && ad.price === cheapestPrice && ads.length > 1 && (
                  <Badge className="ml-2 bg-green-900/40 text-green-400 text-[10px]">
                    Cel mai ieftin
                  </Badge>
                )}
                {ad.isNegotiable && (
                  <span className="text-xs text-[#888] ml-1">negociabil</span>
                )}
              </div>

              {/* Condition */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#666] block mb-1">Stare</span>
                <Badge className={
                  ad.condition === "NEW" ? "bg-[#1B3A2B] text-gold" :
                  ad.condition === "LIKE_NEW" ? "bg-blue-900/40 text-blue-400" :
                  "bg-[#1E1E1E] text-[#EDEDED]/80"
                }>
                  {conditionLabels[ad.condition] || ad.condition}
                </Badge>
              </div>

              {/* Location */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#666] block mb-1">Locatie</span>
                <span className="text-sm text-[#EDEDED] flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#888]" />
                  {ad.city}, {ad.county}
                </span>
              </div>

              {/* Date */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#666] block mb-1">Data publicarii</span>
                <span className="text-sm text-[#EDEDED] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#888]" />
                  {format(new Date(ad.createdAt), "d MMM yyyy", { locale: ro })}
                  <span className="text-[#666] text-xs">
                    ({formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: ro })})
                  </span>
                </span>
              </div>

              {/* Seller */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#666] block mb-1">Vanzator</span>
                <Link
                  href={`/utilizator/${ad.user.id}`}
                  className="text-sm text-gold hover:underline"
                >
                  {ad.user.name || "Utilizator"}
                </Link>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#666] block mb-1">Descriere</span>
                <p className="text-sm text-[#EDEDED]/80 line-clamp-6 whitespace-pre-wrap">
                  {ad.description}
                </p>
              </div>

              {/* CTA */}
              <Link href={`/anunturi/${ad.category.slug}/${ad.slug}`}>
                <Button className="w-full bg-gold text-[#0B0B0B] hover:bg-gold/90 mt-2">
                  Vezi anuntul
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
