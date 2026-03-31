export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lagoana.ro";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/anunturi`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/armurieri`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/publicitate`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/cont/autentificare`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/cont/inregistrare`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Category pages (with images when available)
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, imageUrl: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/anunturi?category=${cat.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
    ...(cat.imageUrl ? { images: [cat.imageUrl] } : {}),
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

  // Public user profiles (active users with at least one active ad)
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      ads: { some: { status: "ACTIVE" } },
    },
    select: { id: true, updatedAt: true },
    take: 500,
  });

  const userPages: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${baseUrl}/utilizator/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticPages, ...categoryPages, ...adPages, ...userPages];
}
