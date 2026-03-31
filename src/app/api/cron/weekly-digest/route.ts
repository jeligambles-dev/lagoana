// ─── Cron Job Setup ────────────────────────────────────────────────
// Digest saptamanal — se trimite un email cu rezumatul saptamanii
// catre toti utilizatorii care au cautari salvate sau favorite.
//
// URL:  https://<your-domain>/api/cron/weekly-digest?secret=<CRON_SECRET>
//
// Interval recomandat: o data pe saptamana, luni dimineata
// Cron expression: 0 8 * * 1   (luni la 08:00)
// HTTP method: GET
// ────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, weeklyDigestEmailHtml } from "@/lib/email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Numarul total de anunturi noi din ultima saptamana
  const newAdsCount = await prisma.ad.count({
    where: {
      status: "ACTIVE",
      createdAt: { gte: oneWeekAgo },
    },
  });

  // Top 5 cele mai noi anunturi
  const topAds = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      createdAt: { gte: oneWeekAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      title: true,
      slug: true,
      price: true,
      currency: true,
      category: { select: { slug: true } },
      images: {
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true, thumbnailUrl: true },
      },
    },
  });

  // Categoriile cu cele mai multe anunturi noi
  const categoryStats = await prisma.ad.groupBy({
    by: ["categoryId"],
    where: {
      status: "ACTIVE",
      createdAt: { gte: oneWeekAgo },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const categoryIds = categoryStats.map((c) => c.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const topCategories = categoryStats.map((c) => ({
    name: categoryMap.get(c.categoryId) || "Altele",
    count: c._count.id,
  }));

  // Pregateste lista de anunturi pentru template
  const digestAds = topAds.map((ad) => ({
    title: ad.title,
    price: ad.price !== null ? `${ad.price.toLocaleString("ro-RO")} ${ad.currency}` : "Pret negociabil",
    imageUrl: ad.images[0]?.thumbnailUrl || ad.images[0]?.url || null,
    url: `/anunturi/${ad.category.slug}/${ad.slug}`,
  }));

  // Nu trimite digest daca nu sunt anunturi noi
  if (newAdsCount === 0) {
    return NextResponse.json({
      success: true,
      message: "Niciun anunt nou saptamana aceasta, digest-ul nu a fost trimis.",
      emailsSent: 0,
    });
  }

  // Gaseste toti utilizatorii cu cautari salvate sau favorite
  const usersWithSavedSearches = await prisma.savedSearch.findMany({
    select: { userId: true },
    distinct: ["userId"],
  });

  const usersWithFavorites = await prisma.favorite.findMany({
    select: { userId: true },
    distinct: ["userId"],
  });

  // Combina si deduplica user IDs
  const userIdSet = new Set<string>();
  usersWithSavedSearches.forEach((s) => userIdSet.add(s.userId));
  usersWithFavorites.forEach((f) => userIdSet.add(f.userId));

  const users = await prisma.user.findMany({
    where: {
      id: { in: Array.from(userIdSet) },
      status: "ACTIVE",
    },
    select: { id: true, email: true },
  });

  const html = weeklyDigestEmailHtml(newAdsCount, digestAds, topCategories);

  let emailsSent = 0;
  let emailsFailed = 0;

  for (const user of users) {
    if (!user.email) continue;

    try {
      const sent = await sendEmail({
        to: user.email,
        subject: `${newAdsCount} anunturi noi saptamana aceasta — Lagoana`,
        html,
      });
      if (sent) emailsSent++;
      else emailsFailed++;
    } catch {
      emailsFailed++;
    }
  }

  return NextResponse.json({
    success: true,
    newAdsCount,
    eligibleUsers: users.length,
    emailsSent,
    emailsFailed,
  });
}
