import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Rate limit: 30 cereri per minut per IP
  const limited = rateLimitByIp(request, "search", 30, 60 * 1000);
  if (limited) return limited;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ ads: [], categories: [], suggestions: [] });
  }

  // Search ads by title (case-insensitive contains)
  const ads = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      currency: true,
      county: true,
      city: true,
      category: { select: { slug: true, name: true } },
      images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Match categories
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      name: { contains: q, mode: "insensitive" },
    },
    select: { name: true, slug: true, parentId: true },
    take: 3,
  });

  // Generate suggestions from ad titles
  const allTitles = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      title: { contains: q, mode: "insensitive" },
    },
    select: { title: true },
    take: 20,
  });

  // Extract unique words that match the query for autocomplete
  const words = new Set<string>();
  for (const ad of allTitles) {
    const titleWords = ad.title.toLowerCase().split(/\s+/);
    for (const word of titleWords) {
      if (word.length > 2 && word.includes(q.toLowerCase())) {
        words.add(word);
      }
    }
  }

  return NextResponse.json({
    ads,
    categories,
    suggestions: Array.from(words).slice(0, 5),
  });
}
