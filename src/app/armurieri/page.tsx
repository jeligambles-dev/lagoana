export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Phone, Mail, Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Armurieri autorizati",
  description: "Lista armurierilor autorizati care pot valida sau supraveghea tranzactiile de arme si munitie.",
};

export default async function ArmurieriPage() {
  const armurieri = await prisma.armurier.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Armurieri autorizati</h1>
        <p className="text-[#888] max-w-2xl">
          Magazine si armurieri autorizati care pot valida sau supraveghea tranzactiile cu arme si munitie.
          Toate transferurile de arme trebuie realizate prin intermediul unui armurier autorizat conform Legii 295/2004.
        </p>
      </div>

      {armurieri.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl border border-[#2A2A2A]">
          <Store className="h-12 w-12 text-[#555] mx-auto mb-3" />
          <p className="text-[#888]">Lista armurierilor va fi disponibila in curand.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {armurieri.map((a) => (
            <Card key={a.id} className="bg-[#111111] border-[#2A2A2A] hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#1B3A2B] rounded-lg flex items-center justify-center shrink-0">
                    {a.logoUrl ? (
                      <img src={a.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <Store className="h-6 w-6 text-gold" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#EDEDED]">{a.name}</h2>
                    <div className="flex items-center gap-1 text-sm text-[#888]">
                      <MapPin className="h-3 w-3" />
                      {a.city}, {a.county}
                    </div>
                  </div>
                </div>

                {a.description && (
                  <p className="text-sm text-[#888] line-clamp-2">{a.description}</p>
                )}

                <div className="text-sm text-[#888]">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {a.address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {a.phone && (
                    <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 text-xs bg-[#1E1E1E] text-[#EDEDED] hover:bg-[#2A2A2A] rounded-full px-3 py-1 transition">
                      <Phone className="h-3 w-3" /> {a.phone}
                    </a>
                  )}
                  {a.email && (
                    <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1 text-xs bg-[#1E1E1E] text-[#EDEDED] hover:bg-[#2A2A2A] rounded-full px-3 py-1 transition">
                      <Mail className="h-3 w-3" /> Email
                    </a>
                  )}
                  {a.website && (
                    <a href={a.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs bg-[#1E1E1E] text-[#EDEDED] hover:bg-[#2A2A2A] rounded-full px-3 py-1 transition">
                      <Globe className="h-3 w-3" /> Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
