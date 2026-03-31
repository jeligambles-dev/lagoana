export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { BulkAdTable } from "@/components/admin/BulkAdTable";

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminAdsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { user: { email: { contains: params.q, mode: "insensitive" } } },
    ];
  }
  if (params.status) where.status = params.status;

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ad.count({ where }),
  ]);

  // Serialize for client component (convert Decimal/Date to plain types)
  const serializedAds = ads.map((ad) => ({
    id: ad.id,
    title: ad.title,
    price: ad.price,
    status: ad.status,
    user: { name: ad.user.name, email: ad.user.email },
    category: { name: ad.category.name },
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#EDEDED]">Gestionare anunturi</h2>

      {/* Search & filters */}
      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Cauta dupa titlu sau email..."
          className="flex-1 h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={params.status}
          className="h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm"
        >
          <option value="">Toate</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expirate</option>
          <option value="REMOVED">Sterse</option>
          <option value="DRAFT">Ciorne</option>
        </select>
        <button type="submit" className="h-10 px-4 bg-gold text-white rounded-md text-sm hover:bg-gold-light">
          Cauta
        </button>
      </form>

      <BulkAdTable ads={serializedAds} />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#888]">
        <span>{total} anunturi</span>
        <div className="flex gap-2">
          {page > 1 && (
            <a href={`/admin/anunturi?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
              className="px-3 py-1 border border-[#2A2A2A] rounded hover:bg-[#1E1E1E]">
              Inapoi
            </a>
          )}
          <span className="px-3 py-1">Pagina {page}</span>
          {page * limit < total && (
            <a href={`/admin/anunturi?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
              className="px-3 py-1 border border-[#2A2A2A] rounded hover:bg-[#1E1E1E]">
              Urmatoarea
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
