import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lagoana.ro";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/anunturi`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/armurieri`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/cont/autentificare`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/cont/inregistrare`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Category pages
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/anunturi?category=${cat.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Ad pages (active only, limit to most recent 1000)
  const ads = await prisma.ad.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });

  const adPages: MetadataRoute.Sitemap = ads.map((ad) => ({
    url: `${baseUrl}/anunturi/${ad.category.slug}/${ad.slug}`,
    lastModified: ad.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...adPages];
}
