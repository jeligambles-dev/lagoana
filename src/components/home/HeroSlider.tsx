"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  company: string | null;
}

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (banners.length === 0) {
    return (
      <section className="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[#EDEDED]">
            Piata ta de <span className="text-gold">vanatoare</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto">
            Cumpara si vinde echipament de vanatoare. Publicare gratuita, simplu si rapid.
          </p>
        </div>
      </section>
    );
  }

  const banner = banners[current];

  const content = (
    <div className="relative rounded-xl overflow-hidden bg-[#1E1E1E]">
      <div className="relative aspect-[21/9] sm:aspect-[3/1]">
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Banner info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          {banner.company && (
            <span className="text-xs sm:text-sm text-gold font-medium">{banner.company}</span>
          )}
          <h2 className="text-lg sm:text-2xl font-bold text-white mt-1 line-clamp-1">{banner.title}</h2>
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
              className={`h-2 rounded-full transition ${
                i === current ? "bg-gold w-6" : "bg-white/40 hover:bg-white/60 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {banner.linkUrl ? (
          <Link href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </section>
  );
}
