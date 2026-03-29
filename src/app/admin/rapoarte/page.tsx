export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AdminReportActions } from "@/components/admin/AdminReportActions";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { name: true, email: true } },
      ad: { select: { id: true, title: true, slug: true, category: { select: { slug: true } } } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    REVIEWED: "bg-blue-100 text-blue-700",
    DISMISSED: "bg-[#1E1E1E] text-[#888]",
    ACTIONED: "bg-[#1B3A2B] text-green-700",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#EDEDED]">Rapoarte & Moderare</h2>

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl">
          <p className="text-[#888]">Nu exista rapoarte.</p>
        </div>
      ) : (
        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] text-left text-[#888] bg-[#111111]">
                <th className="px-4 py-3 font-medium">Anunt</th>
                <th className="px-4 py-3 font-medium">Raportat de</th>
                <th className="px-4 py-3 font-medium">Motiv</th>
                <th className="px-4 py-3 font-medium">Detalii</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actiuni</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-[#1E1E1E] hover:bg-[#1E1E1E]">
                  <td className="px-4 py-3">
                    <a
                      href={`/anunturi/${report.ad.category.slug}/${report.ad.slug}`}
                      className="font-medium text-gold hover:underline truncate block max-w-48"
                    >
                      {report.ad.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{report.reporter.name || report.reporter.email}</td>
                  <td className="px-4 py-3 text-[#EDEDED]/80">{report.reason}</td>
                  <td className="px-4 py-3 text-[#888] max-w-32 truncate">{report.details || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusStyles[report.status] || "bg-[#1E1E1E]"}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <AdminReportActions reportId={report.id} adId={report.ad.id} status={report.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
