import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, savedSearchMatchEmailHtml, priceDropEmailHtml, expiringAdEmailHtml } from "@/lib/email";

// This endpoint is called periodically (e.g., every 15 min) to:
// 1. Check saved searches for new matching ads
// 2. Check favorites for price drops
// 3. Check favorites for ads about to expire
// Protect with a secret key in production
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let savedSearchNotifs = 0;
  let priceDropNotifs = 0;
  let expiringNotifs = 0;

  // ─── 1. Saved search matches ─────────────────────────
  const savedSearches = await prisma.savedSearch.findMany({
    include: { user: { select: { id: true } } },
  });

  for (const search of savedSearches) {
    const filters = JSON.parse(search.filters);
    const since = search.lastNotifiedAt || search.createdAt;

    const where: Record<string, unknown> = {
      status: "ACTIVE" as const,
      createdAt: { gt: since },
    };

    if (search.query) {
      where.OR = [
        { title: { contains: search.query, mode: "insensitive" } },
        { description: { contains: search.query, mode: "insensitive" } },
      ];
    }
    if (filters.category) {
      const cat = await prisma.category.findUnique({
        where: { slug: filters.category },
        include: { children: true },
      });
      if (cat) {
        where.categoryId = { in: [cat.id, ...cat.children.map((c) => c.id)] };
      }
    }
    if (filters.condition) where.condition = filters.condition;
    if (filters.county) where.county = filters.county;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) (where.price as Record<string, number>).gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) (where.price as Record<string, number>).lte = parseFloat(filters.maxPrice);
    }

    const newAds = await prisma.ad.findMany({
      where,
      select: { id: true, title: true, slug: true, price: true, category: { select: { slug: true } } },
      take: 5,
    });

    if (newAds.length > 0) {
      await prisma.notification.create({
        data: {
          userId: search.user.id,
          type: "saved_search_match",
          title: `${newAds.length} anunturi noi pentru "${search.name}"`,
          body: newAds.map((a) => a.title).join(", ").substring(0, 200),
          link: `/anunturi?q=${encodeURIComponent(search.query || "")}`,
        },
      });

      await prisma.savedSearch.update({
        where: { id: search.id },
        data: { lastNotifiedAt: new Date() },
      });

      // Send email notification
      if (search.notifyEmail) {
        const user = await prisma.user.findUnique({ where: { id: search.user.id }, select: { email: true } });
        if (user?.email) {
          sendEmail({
            to: user.email,
            subject: `${newAds.length} anunturi noi pentru "${search.name}" - Lagoana`,
            html: savedSearchMatchEmailHtml(search.name || "Cautare salvata", newAds.map((a) => a.title)),
          }).catch(() => {});
        }
      }

      savedSearchNotifs++;
    }
  }

  // ─── 2. Favorite price drops ─────────────────────────
  const adsWithPriceDrops = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      previousPrice: { not: null },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      previousPrice: true,
      category: { select: { slug: true } },
      favorites: {
        select: { userId: true },
      },
    },
  });

  for (const ad of adsWithPriceDrops) {
    if (ad.price !== null && ad.previousPrice !== null && ad.price < ad.previousPrice) {
      const drop = Math.round(((ad.previousPrice - ad.price) / ad.previousPrice) * 100);

      for (const fav of ad.favorites) {
        // Check if we already sent this notification
        const existing = await prisma.notification.findFirst({
          where: {
            userId: fav.userId,
            type: "favorite_price_drop",
            link: { contains: ad.slug },
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });
        if (existing) continue;

        await prisma.notification.create({
          data: {
            userId: fav.userId,
            type: "favorite_price_drop",
            title: `Pret redus cu ${drop}%!`,
            body: `${ad.title} — de la ${ad.previousPrice?.toLocaleString("ro-RO")} la ${ad.price?.toLocaleString("ro-RO")} RON`,
            link: `/anunturi/${ad.category.slug}/${ad.slug}`,
          },
        });
        priceDropNotifs++;

        // Send email
        const favUser = await prisma.user.findUnique({ where: { id: fav.userId }, select: { email: true } });
        if (favUser?.email) {
          sendEmail({
            to: favUser.email,
            subject: `Pret redus cu ${drop}% — ${ad.title} - Lagoana`,
            html: priceDropEmailHtml(ad.title, ad.previousPrice!, ad.price!, `/anunturi/${ad.category.slug}/${ad.slug}`),
          }).catch(() => {});
        }
      }

      // Clear previousPrice after notifying
      await prisma.ad.update({
        where: { id: ad.id },
        data: { previousPrice: null },
      });
    }
  }

  // ─── 3. Favorites about to expire ───────────────────
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringAds = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: threeDaysFromNow, gt: new Date() },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      expiresAt: true,
      category: { select: { slug: true } },
      favorites: { select: { userId: true } },
    },
  });

  for (const ad of expiringAds) {
    for (const fav of ad.favorites) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: fav.userId,
          type: "favorite_expiring",
          link: { contains: ad.slug },
          createdAt: { gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId: fav.userId,
          type: "favorite_expiring",
          title: "Anunt favorit expira curand",
          body: `${ad.title} expira in mai putin de 3 zile.`,
          link: `/anunturi/${ad.category.slug}/${ad.slug}`,
        },
      });
      expiringNotifs++;

      // Send email
      const favUser = await prisma.user.findUnique({ where: { id: fav.userId }, select: { email: true } });
      if (favUser?.email) {
        sendEmail({
          to: favUser.email,
          subject: `Anunt favorit expira curand — ${ad.title} - Lagoana`,
          html: expiringAdEmailHtml(ad.title, `/anunturi/${ad.category.slug}/${ad.slug}`),
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({
    success: true,
    savedSearchNotifs,
    priceDropNotifs,
    expiringNotifs,
  });
}
