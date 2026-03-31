import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId } = await params;

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    select: {
      id: true,
      userId: true,
      title: true,
      viewsCount: true,
      favoritesCount: true,
      createdAt: true,
    },
  });

  if (!ad) {
    return NextResponse.json({ error: "Anunt negasit." }, { status: 404 });
  }
  if (ad.userId !== session.user.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  // Get daily views for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const dailyViews = await prisma.adView.findMany({
    where: {
      adId,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "asc" },
    select: { date: true, views: true },
  });

  // Fill in missing days with 0 views
  const viewsMap = new Map<string, number>();
  for (const v of dailyViews) {
    const dateStr = new Date(v.date).toISOString().split("T")[0];
    viewsMap.set(dateStr, v.views);
  }

  const chartData: { date: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    chartData.push({ date: dateStr, views: viewsMap.get(dateStr) || 0 });
  }

  // Get favorites count
  const favoritesCount = await prisma.favorite.count({ where: { adId } });

  // Get messages count
  const messagesCount = await prisma.message.count({ where: { adId } });

  // Views today vs yesterday
  const today = chartData[chartData.length - 1]?.views || 0;
  const yesterday = chartData[chartData.length - 2]?.views || 0;

  // Most active day
  const mostActiveDay = chartData.reduce(
    (best, d) => (d.views > best.views ? d : best),
    chartData[0] || { date: "", views: 0 }
  );

  return NextResponse.json({
    title: ad.title,
    totalViews: ad.viewsCount,
    favoritesCount,
    messagesCount,
    viewsToday: today,
    viewsYesterday: yesterday,
    mostActiveDay,
    chartData,
  });
}
