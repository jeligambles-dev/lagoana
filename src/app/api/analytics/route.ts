import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get user's ads with stats
  const ads = await prisma.ad.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      price: true,
      viewsCount: true,
      favoritesCount: true,
      createdAt: true,
      category: { select: { slug: true, name: true } },
      images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
      _count: { select: { messages: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get daily view history for all user's ads
  const adIds = ads.map((a) => a.id);
  const dailyViews = await prisma.adView.findMany({
    where: {
      adId: { in: adIds },
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "asc" },
  });

  // Aggregate daily views across all ads
  const viewsByDate: Record<string, number> = {};
  for (const view of dailyViews) {
    const dateStr = new Date(view.date).toISOString().split("T")[0];
    viewsByDate[dateStr] = (viewsByDate[dateStr] || 0) + view.views;
  }

  // Fill in missing dates with 0
  const chartData = [];
  for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    chartData.push({ date: dateStr, views: viewsByDate[dateStr] || 0 });
  }

  // Per-ad view history
  const viewsByAd: Record<string, { date: string; views: number }[]> = {};
  for (const view of dailyViews) {
    const dateStr = new Date(view.date).toISOString().split("T")[0];
    if (!viewsByAd[view.adId]) viewsByAd[view.adId] = [];
    viewsByAd[view.adId].push({ date: dateStr, views: view.views });
  }

  // Summary stats
  const totalViews = ads.reduce((sum, a) => sum + a.viewsCount, 0);
  const totalFavorites = ads.reduce((sum, a) => sum + a.favoritesCount, 0);
  const totalMessages = ads.reduce((sum, a) => sum + a._count.messages, 0);
  const activeAds = ads.filter((a) => a.status === "ACTIVE").length;
  const soldAds = ads.filter((a) => a.status === "SOLD").length;

  return NextResponse.json({
    summary: { totalViews, totalFavorites, totalMessages, activeAds, soldAds, totalAds: ads.length },
    chartData,
    ads: ads.map((a) => ({
      ...a,
      dailyViews: viewsByAd[a.id] || [],
    })),
  });
}
