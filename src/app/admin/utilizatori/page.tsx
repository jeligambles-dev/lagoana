export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
      { phone: { contains: params.q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true, status: true,
        createdAt: true, isPhoneVerified: true, isIdVerified: true,
        _count: { select: { ads: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#EDEDED]">Gestionare utilizatori</h2>

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Cauta dupa nume, email sau telefon..."
          className="flex-1 h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm"
        />
        <button type="submit" className="h-10 px-4 bg-gold text-white rounded-md text-sm hover:bg-gold-light">
          Cauta
        </button>
      </form>

      <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-left text-[#888] bg-[#111111]">
              <th className="px-4 py-3 font-medium">Nume</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Anunturi</th>
              <th className="px-4 py-3 font-medium">Verificari</th>
              <th className="px-4 py-3 font-medium">Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#1E1E1E] hover:bg-[#1E1E1E]">
                <td className="px-4 py-3 font-medium text-[#EDEDED]">{user.name || "-"}</td>
                <td className="px-4 py-3 text-[#888]">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge className={user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-[#1E1E1E] text-[#888]"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={
                    user.status === "ACTIVE" ? "bg-[#1B3A2B] text-green-700" :
                    user.status === "SUSPENDED" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[#888]">{user._count.ads}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {user.isPhoneVerified && <Badge variant="secondary" className="text-[10px]">Tel</Badge>}
                    {user.isIdVerified && <Badge variant="secondary" className="text-[10px]">ID</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AdminUserActions userId={user.id} status={user.status} role={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-[#888]">
        <span>{total} utilizatori</span>
        <div className="flex gap-2">
          {page > 1 && (
            <a href={`/admin/utilizatori?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
              className="px-3 py-1 border border-[#2A2A2A] rounded hover:bg-[#1E1E1E]">Inapoi</a>
          )}
          <span className="px-3 py-1">Pagina {page}</span>
          {page * limit < total && (
            <a href={`/admin/utilizatori?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
              className="px-3 py-1 border border-[#2A2A2A] rounded hover:bg-[#1E1E1E]">Urmatoarea</a>
          )}
        </div>
      </div>
    </div>
  );
}
