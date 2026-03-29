export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

export default async function AdminAuditPage() {
  const logs = await prisma.adminAuditLog.findMany({
    include: {
      admin: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#EDEDED]">Audit Log</h2>

      <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-left text-[#888] bg-[#111111]">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Actiune</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Target ID</th>
              <th className="px-4 py-3 font-medium">Detalii</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-[#1E1E1E]">
                <td className="px-4 py-3 text-[#888] whitespace-nowrap">
                  {format(new Date(log.createdAt), "dd MMM yyyy HH:mm", { locale: ro })}
                </td>
                <td className="px-4 py-3 text-[#EDEDED]/80">{log.admin.name || log.admin.email}</td>
                <td className="px-4 py-3 font-medium text-[#EDEDED]">{log.action}</td>
                <td className="px-4 py-3 text-[#888]">{log.targetType}</td>
                <td className="px-4 py-3 text-[#888] font-mono text-xs">{log.targetId.substring(0, 12)}...</td>
                <td className="px-4 py-3 text-[#888] max-w-48 truncate">{log.details || "-"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#666]">
                  Nu exista inregistrari in audit log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
