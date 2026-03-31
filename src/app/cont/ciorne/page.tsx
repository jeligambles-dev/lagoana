export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, FileEdit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { DeleteAdButton } from "@/components/ads/DeleteAdButton";

export default async function DraftsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/cont/autentificare");

  const drafts = await prisma.ad.findMany({
    where: { userId: session.user.id, status: "DRAFT" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { slug: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#EDEDED]">Ciornele mele</h1>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl">
          <FileEdit className="h-10 w-10 text-[#444] mx-auto mb-3" />
          <p className="text-[#888] mb-4">Nu ai nicio ciorna salvata.</p>
          <Button render={<Link href="/publica" />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
            Publica un anunt
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => {
            const imageUrl = draft.images[0]?.url;

            return (
              <Card key={draft.id} className="bg-[#111111] border-[#2A2A2A]">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-[#1E1E1E] rounded-lg overflow-hidden shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#666] text-xs">
                          Fara foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-[#EDEDED] line-clamp-1">
                            {draft.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-[#2A2A2A] text-[#888]">Ciorna</Badge>
                            {draft.category && (
                              <span className="text-sm text-[#888]">{draft.category.name}</span>
                            )}
                          </div>
                        </div>
                        {draft.price && (
                          <span className="font-bold text-gold shrink-0">
                            {draft.price.toLocaleString("ro-RO")} RON
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-[#888]">
                        <span>
                          Actualizat {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true, locale: ro })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Button render={<Link href={`/publica?draft=${draft.id}`} />} variant="outline" size="sm">
                          <Pencil className="h-3 w-3 mr-1" /> Continua editarea
                        </Button>
                        <DeleteAdButton adId={draft.id} />
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
