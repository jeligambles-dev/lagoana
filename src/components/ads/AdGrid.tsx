"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AdCard } from "@/components/ads/AdCard";
import { AdCardSkeleton } from "@/components/ads/AdCardSkeleton";
import { Loader2 } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  currency: string;
  isNegotiable: boolean;
  condition: string;
  county: string;
  city: string;
  createdAt: Date;
  promotedUntil: Date | null;
  spotlightUntil: Date | null;
  category: { slug: string; name: string };
  images: { url: string; thumbnailUrl: string | null }[];
}

interface AdGridProps {
  initialAds: Ad[];
  initialTotal: number;
  searchParams: Record<string, string | undefined>;
}

export function AdGrid({ initialAds, initialTotal, searchParams }: AdGridProps) {
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialAds.length < initialTotal);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const nextPage = page + 1;
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (searchParams.q) params.set("q", searchParams.q);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.condition) params.set("condition", searchParams.condition);
    if (searchParams.county) params.set("county", searchParams.county);
    if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
    if (searchParams.sort) params.set("sort", searchParams.sort);

    try {
      const res = await fetch(`/api/ads?${params.toString()}`);
      const data = await res.json();

      if (data.ads.length === 0) {
        setHasMore(false);
      } else {
        setAds((prev) => [...prev, ...data.ads]);
        setPage(nextPage);
        setHasMore(nextPage < data.totalPages);
      }
    } catch {
      // silently fail, user can scroll again
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchParams]);

  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <AdCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {/* Load more trigger */}
      {hasMore && !loading && <div ref={observerRef} className="h-10" />}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#666]" />
        </div>
      )}

      {/* End of results */}
      {!hasMore && ads.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-[#666]">Nu mai sunt anunturi</p>
        </div>
      )}
    </>
  );
}
