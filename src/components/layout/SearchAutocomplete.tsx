"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Tag, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  ads: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
    currency: string;
    county: string;
    city: string;
    category: { slug: string; name: string };
    images: { url: string }[];
  }[];
  categories: { name: string; slug: string }[];
  suggestions: string[];
}

export function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setOpen(true);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/anunturi?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  function handleSelect(url: string) {
    setOpen(false);
    setQuery("");
    router.push(url);
  }

  const hasResults = results && (results.ads.length > 0 || results.categories.length > 0 || results.suggestions.length > 0);

  return (
    <div ref={containerRef} className="relative flex-1">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666]" />
          <Input
            type="search"
            placeholder="Cauta arme, optica, echipament..."
            className="h-12 pl-12 pr-4 text-base bg-[#1E1E1E] border-[#2A2A2A] text-[#EDEDED] placeholder:text-[#555] rounded-lg focus:border-gold"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hasResults && setOpen(true)}
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666] animate-spin" />
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#151515] border border-[#2A2A2A] rounded-lg shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">

          {/* Suggestions */}
          {results!.suggestions.length > 0 && (
            <div className="p-2 border-b border-[#2A2A2A]">
              {results!.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSelect(`/anunturi?q=${encodeURIComponent(s)}`); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[#EDEDED]/80 hover:bg-[#1E1E1E] rounded transition"
                >
                  <Search className="h-3 w-3 text-[#666]" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {results!.categories.length > 0 && (
            <div className="p-2 border-b border-[#2A2A2A]">
              <p className="px-3 py-1 text-[10px] text-[#666] uppercase tracking-wider">Categorii</p>
              {results!.categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleSelect(`/anunturi?category=${cat.slug}`)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[#EDEDED] hover:bg-[#1E1E1E] rounded transition"
                >
                  <Tag className="h-3 w-3 text-gold" />
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Ads */}
          {results!.ads.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1 text-[10px] text-[#666] uppercase tracking-wider">Anunturi</p>
              {results!.ads.map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => handleSelect(`/anunturi/${ad.category.slug}/${ad.slug}`)}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-[#1E1E1E] rounded transition"
                >
                  <div className="w-10 h-10 bg-[#1E1E1E] rounded overflow-hidden shrink-0">
                    {ad.images[0] ? (
                      <img src={ad.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#666] text-[8px]">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm text-[#EDEDED] truncate">{ad.title}</p>
                    <p className="text-xs text-[#888]">{ad.county} &middot; {ad.category.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gold shrink-0">
                    {ad.price ? `${ad.price.toLocaleString("ro-RO")} RON` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* See all results */}
          <button
            onClick={() => handleSelect(`/anunturi?q=${encodeURIComponent(query)}`)}
            className="flex items-center justify-center gap-2 w-full px-3 py-3 text-sm text-gold hover:bg-[#1E1E1E] border-t border-[#2A2A2A] transition"
          >
            Vezi toate rezultatele <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
