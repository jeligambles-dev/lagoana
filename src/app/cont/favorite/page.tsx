export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdCard } from "@/components/ads/AdCard";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/cont/autentificare");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      ad: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: { select: { slug: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeAds = favorites
    .filter((f) => f.ad.status === "ACTIVE")
    .map((f) => f.ad);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Favorite</h1>

      {activeAds.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-xl">
          <p className="text-stone-500">Nu ai salvat niciun anunt la favorite.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
}
