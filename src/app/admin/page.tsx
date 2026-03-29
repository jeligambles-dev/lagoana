export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, Eye } from "lucide-react";

export default async function AdminDashboard() {
  const [totalUsers, activeAds, pendingReports, todayAds] = await Promise.all([
    prisma.user.count(),
    prisma.ad.count({ where: { status: "ACTIVE" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.ad.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const stats = [
    { label: "Utilizatori", value: totalUsers, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Anunturi active", value: activeAds, icon: FileText, color: "text-green-600 bg-[#1B3A2B]" },
    { label: "Anunturi azi", value: todayAds, icon: Eye, color: "text-amber-600 bg-amber-100" },
    { label: "Rapoarte in asteptare", value: pendingReports, icon: AlertTriangle, color: "text-red-600 bg-red-100" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#EDEDED]">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#EDEDED]">{stat.value}</p>
                  <p className="text-xs text-[#888]">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anunturi recente</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentAds />
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentAds() {
  const ads = await prisma.ad.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2A2A2A] text-left text-[#888]">
            <th className="pb-2 font-medium">Titlu</th>
            <th className="pb-2 font-medium">Utilizator</th>
            <th className="pb-2 font-medium">Categorie</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Pret</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad.id} className="border-b border-[#1E1E1E]">
              <td className="py-2 font-medium text-[#EDEDED] max-w-48 truncate">{ad.title}</td>
              <td className="py-2 text-[#888]">{ad.user.name || ad.user.email}</td>
              <td className="py-2 text-[#888]">{ad.category.name}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  ad.status === "ACTIVE" ? "bg-[#1B3A2B] text-green-700" :
                  ad.status === "REMOVED" ? "bg-red-100 text-red-700" :
                  "bg-[#1E1E1E] text-[#888]"
                }`}>
                  {ad.status}
                </span>
              </td>
              <td className="py-2 text-[#888]">
                {ad.price ? `${ad.price.toLocaleString("ro-RO")} RON` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
