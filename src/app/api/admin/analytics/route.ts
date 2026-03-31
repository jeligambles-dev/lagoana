import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Parallel queries
  const [
    totalActiveAds,
    totalUsers,
    pendingReports,
    adsRaw,
    usersRaw,
    categoryData,
    recentLogs,
  ] = await Promise.all([
    prisma.ad.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    // Ads created in last 30 days (raw dates)
    prisma.ad.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Users registered in last 30 days
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Category counts
    prisma.category.findMany({
      where: { parentId: { not: null } },
      select: {
        name: true,
        _count: { select: { ads: true } },
      },
      orderBy: { ads: { _count: "desc" } },
      take: 10,
    }),
    // Recent audit logs
    prisma.adminAuditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { name: true, email: true } },
      },
    }),
  ]);

  // Group ads by day
  const adsPerDay = groupByDay(adsRaw.map((a) => a.createdAt), thirtyDaysAgo);
  const usersPerDay = groupByDay(usersRaw.map((u) => u.createdAt), thirtyDaysAgo);

  const categories = categoryData.map((c) => ({
    name: c.name,
    count: c._count.ads,
  }));

  const auditLogs = recentLogs.map((log) => ({
    id: log.id,
    adminName: log.admin.name || log.admin.email,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    createdAt: log.createdAt.toISOString(),
  }));

  return NextResponse.json({
    stats: { totalActiveAds, totalUsers, pendingReports },
    adsPerDay,
    usersPerDay,
    categories,
    auditLogs,
  });
}

function groupByDay(dates: Date[], startDate: Date) {
  const map: Record<string, number> = {};

  // Initialize all 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    map[key] = 0;
  }

  for (const date of dates) {
    const key = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    if (key in map) map[key]++;
  }

  return Object.entries(map).map(([label, value]) => ({ label, value }));
}
