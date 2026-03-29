import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0F1111] border-t border-[#2A2A2A] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Lagoana" width={200} height={200} className="h-20 w-20" />
              <span className="text-lg font-bold text-gold">Lagoana</span>
            </div>
            <p className="text-sm text-[#888]">
              Piata ta de echipament de vanatoare. Cumpara si vinde liber, simplu si sigur.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-[#EDEDED] mb-3">Navigare</h3>
            <ul className="space-y-2 text-sm text-[#888]">
              <li><Link href="/anunturi" className="hover:text-gold transition">Toate anunturile</Link></li>
              <li><Link href="/publica" className="hover:text-gold transition">Publica anunt</Link></li>
              <li><Link href="/armurieri" className="hover:text-gold transition">Armurieri autorizati</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-[#EDEDED] mb-3">Categorii</h3>
            <ul className="space-y-2 text-sm text-[#888]">
              <li><Link href="/anunturi?category=arme-de-foc" className="hover:text-gold transition">Arme de foc</Link></li>
              <li><Link href="/anunturi?category=optica" className="hover:text-gold transition">Optica</Link></li>
              <li><Link href="/anunturi?category=echipament" className="hover:text-gold transition">Echipament</Link></li>
              <li><Link href="/anunturi?category=accesorii-arme" className="hover:text-gold transition">Accesorii</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-[#EDEDED] mb-3">Informatii</h3>
            <ul className="space-y-2 text-sm text-[#888]">
              <li><Link href="/despre" className="hover:text-gold transition">Despre noi</Link></li>
              <li><Link href="/termeni" className="hover:text-gold transition">Termeni si conditii</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] mt-8 pt-8 text-center text-sm text-[#555]">
          <p>&copy; {new Date().getFullYear()} Lagoana. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
