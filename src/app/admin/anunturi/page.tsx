export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AdminAdActions } from "@/components/admin/AdminAdActions";

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

      <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-left text-[#888] bg-[#111111]">
              <th className="px-4 py-3 font-medium">Titlu</th>
              <th className="px-4 py-3 font-medium">Utilizator</th>
              <th className="px-4 py-3 font-medium">Categorie</th>
              <th className="px-4 py-3 font-medium">Pret</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.id} className="border-b border-[#1E1E1E] hover:bg-[#1E1E1E]">
                <td className="px-4 py-3 font-medium text-[#EDEDED] max-w-56 truncate">{ad.title}</td>
                <td className="px-4 py-3 text-[#888]">{ad.user.name || ad.user.email}</td>
                <td className="px-4 py-3 text-[#888]">{ad.category.name}</td>
                <td className="px-4 py-3 text-[#888]">
                  {ad.price ? `${ad.price.toLocaleString("ro-RO")} RON` : "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge className={
                    ad.status === "ACTIVE" ? "bg-[#1B3A2B] text-green-700" :
                    ad.status === "REMOVED" ? "bg-red-100 text-red-700" :
                    "bg-[#1E1E1E] text-[#888]"
                  }>
                    {ad.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminAdActions adId={ad.id} status={ad.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
