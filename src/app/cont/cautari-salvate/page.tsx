"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, Search, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface SavedSearch {
  id: string;
  name: string | null;
  query: string | null;
  filters: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saved-searches")
      .then((r) => r.json())
      .then((data) => { setSearches(data); setLoading(false); });
  }, []);

  async function handleDelete(id: string) {
    const res = await fetch("/api/saved-searches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success("Cautare stearsa.");
    }
  }

  function buildSearchUrl(search: SavedSearch): string {
    const params = new URLSearchParams();
    if (search.query) params.set("q", search.query);
    const filters = JSON.parse(search.filters);
    if (filters.category) params.set("category", filters.category);
    if (filters.condition) params.set("condition", filters.condition);
    if (filters.county) params.set("county", filters.county);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    return `/anunturi?${params.toString()}`;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#EDEDED]">Cautari salvate</h1>

      {searches.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl border border-[#2A2A2A]">
          <Bell className="h-12 w-12 text-[#555] mx-auto mb-3" />
          <p className="text-[#888] mb-2">Nu ai salvat nicio cautare.</p>
          <p className="text-[#666] text-sm mb-4">Mergi la pagina de anunturi, aplica filtre si salveaza cautarea pentru a primi notificari.</p>
          <Button render={<Link href="/anunturi" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
            <Search className="h-4 w-4 mr-1.5" /> Cauta anunturi
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => {
            const filters = JSON.parse(search.filters);
            return (
              <Card key={search.id} className="bg-[#111111] border-[#2A2A2A]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gold" />
                      <span className="font-medium text-[#EDEDED]">{search.name || "Cautare salvata"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {search.query && <Badge variant="secondary" className="text-xs">{search.query}</Badge>}
                      {filters.category && <Badge variant="secondary" className="text-xs">{filters.category}</Badge>}
                      {filters.county && <Badge variant="secondary" className="text-xs">{filters.county}</Badge>}
                      {(filters.minPrice || filters.maxPrice) && (
                        <Badge variant="secondary" className="text-xs">
                          {filters.minPrice || "0"} - {filters.maxPrice || "∞"} RON
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button render={<Link href={buildSearchUrl(search)} />} variant="outline" size="sm" className="border-[#2A2A2A]">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(search.id)} className="border-[#2A2A2A] text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
