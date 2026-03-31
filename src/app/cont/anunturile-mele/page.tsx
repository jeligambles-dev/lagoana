export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Eye, Heart, Edit, Pencil, Trash2, RotateCcw, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { DeleteAdButton } from "@/components/ads/DeleteAdButton";
import { MarkSoldButton } from "@/components/ads/MarkSoldButton";

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Activ", className: "bg-[#1B3A2B] text-gold" },
  SOLD: { label: "Vandut", className: "bg-gold/20 text-gold" },
  EXPIRED: { label: "Expirat", className: "bg-amber-900/30 text-amber-400" },
  DRAFT: { label: "Ciorna", className: "bg-[#2A2A2A] text-[#888]" },
  REMOVED: { label: "Sters", className: "bg-red-900/30 text-red-400" },
};

export default async function MyAdsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/cont/autentificare");

  const ads = await prisma.ad.findMany({
    where: { userId: session.user.id },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#EDEDED]">Anunturile mele</h1>
        <Button render={<Link href="/publica" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Anunt nou
        </Button>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl">
          <p className="text-[#888] mb-4">Nu ai publicat niciun anunt.</p>
          <Button render={<Link href="/publica" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
            Publica primul anunt
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => {
            const status = statusLabels[ad.status] || statusLabels.ACTIVE;
            const imageUrl = ad.images[0]?.url;

            return (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                          Fara foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/anunturi/${ad.category.slug}/${ad.slug}`}
                            className="font-medium text-[#EDEDED] hover:text-gold line-clamp-1"
                          >
                            {ad.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={status.className}>{status.label}</Badge>
                            <span className="text-sm text-[#888]">{ad.category.name}</span>
                          </div>
                        </div>
                        <span className="font-bold text-gold shrink-0">
                          {ad.price ? `${ad.price.toLocaleString("ro-RO")} RON` : "-"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-[#888]">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {ad.viewsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {ad.favoritesCount}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: ro })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {ad.status === "ACTIVE" && (
                          <>
                            <Button render={<Link href={`/anunturi/${ad.category.slug}/${ad.slug}`} />} variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" /> Vezi
                            </Button>
                            <Button render={<Link href={`/cont/anunturile-mele/editeaza/${ad.id}`} />} variant="outline" size="sm">
                                <Pencil className="h-3 w-3 mr-1" /> Editeaza
                            </Button>
                            <Button render={<Link href={`/cont/anunturile-mele/analytics/${ad.id}`} />} variant="outline" size="sm">
                                <BarChart3 className="h-3 w-3 mr-1" /> Statistici
                            </Button>
                            <MarkSoldButton adId={ad.id} />
                          </>
                        )}
                        {ad.status === "DRAFT" && (
                          <Button render={<Link href={`/publica?draft=${ad.id}`} />} variant="outline" size="sm">
                              <Pencil className="h-3 w-3 mr-1" /> Continua editarea
                          </Button>
                        )}
                        {ad.status !== "REMOVED" && ad.status !== "SOLD" && (
                          <DeleteAdButton adId={ad.id} />
                        )}
                      </div>
                    </div>
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
