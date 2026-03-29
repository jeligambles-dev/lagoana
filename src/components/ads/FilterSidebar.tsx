"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTIES } from "@/lib/constants";
import { Filter, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
}

interface FilterSidebarProps {
  categories: Category[];
  currentParams: Record<string, string | undefined>;
}

export function FilterSidebar({ categories, currentParams }: FilterSidebarProps) {
  const router = useRouter();
  const [category, setCategory] = useState(currentParams.category || "");
  const [condition, setCondition] = useState(currentParams.condition || "");
  const [county, setCounty] = useState(currentParams.county || "");
  const [minPrice, setMinPrice] = useState(currentParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice || "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (currentParams.q) params.set("q", currentParams.q);
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (county) params.set("county", county);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (currentParams.sort) params.set("sort", currentParams.sort);
    router.push(`/anunturi?${params.toString()}`);
  }

  function clearFilters() {
    setCategory("");
    setCondition("");
    setCounty("");
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams();
    if (currentParams.q) params.set("q", currentParams.q);
    router.push(`/anunturi?${params.toString()}`);
  }

  return (
    <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4 space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#EDEDED] flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-gold" /> Filtre
        </h3>
        <button onClick={clearFilters} className="text-xs text-[#888] hover:text-gold flex items-center gap-1">
          <X className="h-3 w-3" /> Reseteaza
        </button>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-sm text-[#EDEDED]">Categorie</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-9 rounded-md border border-[#2A2A2A] bg-[#1E1E1E] text-[#EDEDED] px-3 text-sm"
        >
          <option value="">Toate</option>
          {categories.map((cat) => (
            <optgroup key={cat.id} label={cat.name}>
              <option value={cat.slug}>{cat.name} (toate)</option>
              {cat.children?.map((sub) => (
                <option key={sub.id} value={sub.slug}>{sub.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-sm text-[#EDEDED]">Stare</Label>
        <div className="space-y-1">
          {[
            { value: "", label: "Toate" },
            { value: "NEW", label: "Nou" },
            { value: "LIKE_NEW", label: "Ca nou" },
            { value: "USED", label: "Folosit" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="condition"
                value={opt.value}
                checked={condition === opt.value}
                onChange={(e) => setCondition(e.target.value)}
                className="text-gold focus:ring-gold accent-gold"
              />
              <span className="text-sm text-[#EDEDED]">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label className="text-sm text-[#EDEDED]">Pret (RON)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 bg-[#1E1E1E] border-[#2A2A2A] text-[#EDEDED] placeholder:text-[#666]"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 bg-[#1E1E1E] border-[#2A2A2A] text-[#EDEDED] placeholder:text-[#666]"
          />
        </div>
      </div>

      {/* County */}
      <div className="space-y-2">
        <Label className="text-sm text-[#EDEDED]">Judet</Label>
        <select
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="w-full h-9 rounded-md border border-[#2A2A2A] bg-[#1E1E1E] text-[#EDEDED] px-3 text-sm"
        >
          <option value="">Toate</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <Button onClick={applyFilters} className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
        Aplica filtre
      </Button>
    </div>
  );
}
