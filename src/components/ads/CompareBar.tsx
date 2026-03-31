"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompareItems, setCompareItems, type CompareItem } from "./CompareButton";

export function CompareBar() {
  const router = useRouter();
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getCompareItems());
    sync();
    window.addEventListener("compare-updated", sync);
    return () => window.removeEventListener("compare-updated", sync);
  }, []);

  function removeItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setCompareItems(updated);
    setItems(updated);
  }

  function clearAll() {
    setCompareItems([]);
    setItems([]);
  }

  function goCompare() {
    const ids = items.map((i) => i.id).join(",");
    router.push(`/anunturi/compara?ids=${ids}`);
  }

  if (items.length < 2) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2A2A2A] px-4 py-3 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A]">
              <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeItem(item.id)}
                className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5"
              >
                <X className="h-2.5 w-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={clearAll} className="text-xs">
            Sterge
          </Button>
          <Button size="sm" onClick={goCompare} className="bg-gold text-[#0B0B0B] hover:bg-gold/90 text-xs">
            <GitCompareArrows className="h-3.5 w-3.5 mr-1" />
            Compara ({items.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
