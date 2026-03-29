import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <Image src="/logo.png" alt="Lagoana" width={120} height={120} className="h-20 w-20 mx-auto mb-6 opacity-50" />
        <h1 className="text-6xl font-bold text-gold mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[#EDEDED] mb-3">Pagina nu a fost gasita</h2>
        <p className="text-[#888] mb-8">
          Pagina pe care o cauti nu exista sau a fost mutata.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button render={<Link href="/" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
            <Home className="h-4 w-4 mr-1.5" /> Acasa
          </Button>
          <Button render={<Link href="/anunturi" />} variant="outline" className="border-[#2A2A2A] text-[#EDEDED]">
            <Search className="h-4 w-4 mr-1.5" /> Cauta anunturi
          </Button>
        </div>
      </div>
    </div>
  );
}
