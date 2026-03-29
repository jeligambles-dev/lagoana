"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <Image src="/logo.png" alt="Lagoana" width={120} height={120} className="h-20 w-20 mx-auto mb-6 opacity-50" />
        <h1 className="text-4xl font-bold text-red-400 mb-2">Eroare</h1>
        <h2 className="text-xl font-semibold text-[#EDEDED] mb-3">Ceva nu a mers bine</h2>
        <p className="text-[#888] mb-8">
          A aparut o eroare neasteptata. Incearca din nou sau revino mai tarziu.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
            <RefreshCcw className="h-4 w-4 mr-1.5" /> Incearca din nou
          </Button>
          <Button render={<Link href="/" />} variant="outline" className="border-[#2A2A2A] text-[#EDEDED]">
            <Home className="h-4 w-4 mr-1.5" /> Acasa
          </Button>
        </div>
      </div>
    </div>
  );
}
