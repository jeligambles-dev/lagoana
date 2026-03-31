"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setEmail("");
      } else {
        setError(data.error || "Eroare la abonare.");
      }
    } catch {
      setError("Eroare de retea. Incearca din nou.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-[#EDEDED] mb-3">Newsletter</h3>
      <p className="text-sm text-[#888]">
        Aboneaza-te pentru a primi cele mai noi anunturi si oferte.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email-ul tau"
          required
          className="flex-1 h-10 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-sm text-[#EDEDED] placeholder:text-[#555] focus:outline-none focus:border-[#C8A962] transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 px-4 rounded-md bg-[#C8A962] text-[#0B0B0B] text-sm font-semibold hover:bg-[#D4B96E] transition disabled:opacity-50"
        >
          {loading ? "..." : "Aboneaza-te"}
        </button>
      </form>
      {message && <p className="text-sm text-green-400">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0F1111] border-t border-[#2A2A2A] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
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
              <li><Link href="/publicitate" className="hover:text-gold transition">Publicitate</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <NewsletterForm />
        </div>

        <div className="border-t border-[#2A2A2A] mt-8 pt-8 text-center text-sm text-[#555]">
          <p>&copy; {new Date().getFullYear()} Lagoana. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
