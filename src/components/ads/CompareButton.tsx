"use client";

import { useState, useEffect } from "react";
import { GitCompareArrows } from "lucide-react";
import { toast } from "sonner";

const COMPARE_KEY = "lagoana_compare";
const MAX_COMPARE = 4;

export interface CompareItem {
  id: string;
  thumbnail: string;
}

export function getCompareItems(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCompareIds(): string[] {
  return getCompareItems().map((i) => i.id);
}

export function setCompareItems(items: CompareItem[]) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("compare-updated"));
}

interface CompareButtonProps {
  adId: string;
  thumbnail?: string;
}

export function CompareButton({ adId, thumbnail }: CompareButtonProps) {
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const check = () => setIsSelected(getCompareIds().includes(adId));
    check();
    window.addEventListener("compare-updated", check);
    return () => window.removeEventListener("compare-updated", check);
  }, [adId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const items = getCompareItems();
    if (isSelected) {
      setCompareItems(items.filter((i) => i.id !== adId));
      setIsSelected(false);
    } else {
      if (items.length >= MAX_COMPARE) {
        toast.error(`Maxim ${MAX_COMPARE} anunturi pentru comparatie`);
        return;
      }
      setCompareItems([...items, { id: adId, thumbnail: thumbnail || "/placeholder.svg" }]);
      setIsSelected(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`absolute bottom-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-sm transition-all ${
        isSelected
          ? "bg-gold text-[#0B0B0B]"
          : "bg-[#0B0B0B]/60 text-[#EDEDED] hover:bg-[#0B0B0B]/80"
      }`}
      title={isSelected ? "Scoate din comparatie" : "Adauga la comparatie"}
    >
      <GitCompareArrows className="h-3.5 w-3.5" />
    </button>
  );
}
