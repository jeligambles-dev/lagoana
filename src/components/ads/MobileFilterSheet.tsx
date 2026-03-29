"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
}

interface MobileFilterSheetProps {
  categories: Category[];
  currentParams: Record<string, string | undefined>;
}

export function MobileFilterSheet({ categories, currentParams }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="lg:hidden border-[#2A2A2A] text-[#EDEDED]" />}>
        <SlidersHorizontal className="h-4 w-4 mr-1.5" />
        Filtre
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-[#0B0B0B] border-[#2A2A2A] max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-[#EDEDED]">Filtre</SheetTitle>
        </SheetHeader>
        <div className="mt-4 [&>div]:bg-transparent [&>div]:border-0 [&>div]:p-0 [&>div]:static">
          <FilterSidebar categories={categories} currentParams={currentParams} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
