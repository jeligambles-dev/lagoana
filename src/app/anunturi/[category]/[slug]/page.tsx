export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdGallery } from "@/components/ads/AdGallery";
import { ContactButton } from "@/components/ads/ContactButton";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { ReportButton } from "@/components/ads/ReportButton";
import { ShareButtons } from "@/components/ads/ShareButtons";
import { SellerBadges } from "@/components/ads/SellerBadges";
import { AdCard } from "@/components/ads/AdCard";
import { ReviewSection, SellerRatingBadge } from "@/components/ads/ReviewSection";
import { PhoneButton } from "@/components/ads/PhoneButton";
import {
  MapPin, Clock, Eye, User, Shield, Star, Calendar,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

async function getCategoryPriceStats(categoryId: string, adId: string) {
  const otherAds = await prisma.ad.findMany({
    where: {
      categoryId,
      status: "ACTIVE",
      id: { not: adId },
      price: { not: null, gt: 0 },
    },
    select: { price: true },
  });

  if (otherAds.length < 3) return null;

  const prices = otherAds.map((a) => a.price as number);
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  return { average: Math.round(avg), count: prices.length };
}

function getPriceComparison(price: number, average: number) {
  const ratio = price / average;
  if (ratio <= 0.85) {
    return { label: "Sub media categoriei", color: "text-green-400", bg: "bg-green-900/30" };
  }
  if (ratio >= 1.15) {
    return { label: "Peste media categoriei", color: "text-orange-400", bg: "bg-orange-900/30" };
  }
  return { label: "Pret mediu", color: "text-[#888]", bg: "bg-[#1E1E1E]" };
}

async function getAd(slug: string) {
  const ad = await prisma.ad.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { select: { id: true, slug: true, name: true, parentId: true } },
      attributes: true,
      user: {
        select: {
          id: true, name: true, avatarUrl: true, createdAt: true,
          isPhoneVerified: true, isIdVerified: true, phone: true,
          _count: { select: { ads: { where: { status: "ACTIVE" } } } },
        },
      },
    },
  });

  if (!ad || ad.status !== "ACTIVE") return null;
  return ad;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ad = await getAd(slug);
  if (!ad) return { title: "Anunt negasit" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lagoana.ro";
  const ogImageUrl = `${baseUrl}/api/og/${ad.id}`;

  return {
    title: ad.title,
    description: ad.description.substring(0, 160),
    openGraph: {
      title: ad.title,
      description: ad.description.substring(0, 160),
      url: `${baseUrl}/anunturi/${ad.category.slug}/${ad.slug}`,
      siteName: "Lagoana",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      locale: "ro_RO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ad.title,
      description: ad.description.substring(0, 160),
      images: [ogImageUrl],
    },
  };
}

export default async function AdDetailPage({ params }: Props) {
  const { slug } = await params;
  const ad = await getAd(slug);
  if (!ad) notFound();

  const session = await auth();

  // Price comparison stats
  const priceStats = ad.price != null && ad.price > 0
    ? await getCategoryPriceStats(ad.categoryId, ad.id)
    : null;
  const priceComparison = priceStats && ad.price != null
    ? getPriceComparison(ad.price, priceStats.average)
    : null;

  // Increment view count + track daily analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Promise.all([
    prisma.ad.update({
      where: { id: ad.id },
      data: { viewsCount: { increment: 1 } },
    }),
    prisma.adView.upsert({
      where: { adId_date: { adId: ad.id, date: today } },
      update: { views: { increment: 1 } },
      create: { adId: ad.id, date: today, views: 1, userId: session?.user?.id || null },
    }),
  ]);

  // Check if favorited
  let isFavorited = false;
  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_adId: { userId: session.user.id, adId: ad.id } },
    });
    isFavorited = !!fav;
  }

  // Similar ads
  const similarAds = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      categoryId: ad.categoryId,
      id: { not: ad.id },
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { slug: true, name: true } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // Check if current user had a conversation (is a buyer)
  let isBuyer = false;
  if (session?.user?.id && session.user.id !== ad.userId) {
    const msg = await prisma.message.findFirst({
      where: {
        adId: ad.id,
        OR: [
          { senderId: session.user.id, receiverId: ad.userId },
          { senderId: ad.userId, receiverId: session.user.id },
        ],
      },
    });
    isBuyer = !!msg;
  }

  const conditionLabels: Record<string, string> = {
    NEW: "Nou",
    USED: "Folosit",
    LIKE_NEW: "Ca nou",
  };

  const isOwner = session?.user?.id === ad.userId;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lagoana.ro";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: ad.title,
    description: ad.description.substring(0, 500),
    image: ad.images.map((img) => `${baseUrl}${img.url}`),
    offers: {
      "@type": "Offer",
      price: ad.price ?? undefined,
      priceCurrency: ad.currency,
      availability: "https://schema.org/InStock",
      itemCondition: ad.condition === "NEW" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      seller: {
        "@type": "Person",
        name: ad.user.name || "Utilizator Lagoana",
      },
      areaServed: {
        "@type": "Place",
        name: `${ad.city}, ${ad.county}, Romania`,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Gallery */}
          <AdGallery images={ad.images} />

          {/* Title & Price */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{ad.category.name}</Badge>
              <Badge className={
                ad.condition === "NEW" ? "bg-[#1B3A2B] text-gold" :
                ad.condition === "LIKE_NEW" ? "bg-blue-100 text-blue-800" :
                "bg-[#1E1E1E] text-[#EDEDED]/80"
              }>
                {conditionLabels[ad.condition]}
              </Badge>
              {ad.promotedUntil && new Date(ad.promotedUntil) > new Date() && (
                <Badge className="bg-amber-100 text-amber-800">
                  <Star className="h-3 w-3 mr-0.5" /> Promovat
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#EDEDED]">{ad.title}</h1>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gold">
                {ad.price != null ? `${ad.price.toLocaleString("ro-RO")} ${ad.currency}` : "Pret la cerere"}
              </span>
              {ad.isNegotiable && (
                <span className="text-sm text-[#888]">negociabil</span>
              )}
            </div>

            {priceComparison && priceStats && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${priceComparison.bg} ${priceComparison.color}`}>
                  {priceComparison.label}
                </span>
                <span className="text-xs text-[#666]">
                  Media: {priceStats.average.toLocaleString("ro-RO")} {ad.currency} ({priceStats.count} anunturi)
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-[#888]">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {ad.city}, {ad.county}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: ro })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {ad.viewsCount} vizualizari
              </span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-[#EDEDED] mb-3">Descriere</h2>
            <div className="text-[#EDEDED]/80 whitespace-pre-wrap leading-relaxed">
              {ad.description}
            </div>
          </div>

          {/* Attributes */}
          {ad.attributes.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold text-[#EDEDED] mb-3">Specificatii</h2>
                <div className="grid grid-cols-2 gap-3">
                  {ad.attributes.map((attr) => (
                    <div key={attr.id} className="flex justify-between bg-[#111111] rounded-lg px-3 py-2">
                      <span className="text-sm text-[#888]">{attr.key}</span>
                      <span className="text-sm font-medium text-[#EDEDED]">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Safety tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-900 text-sm mb-1">Sfaturi de siguranta</h3>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>Intalniti-va in locuri publice pentru tranzactii.</li>
              <li>Verificati documentele si permisele inainte de achizitie.</li>
              <li>Nu trimiteti bani in avans fara garantii.</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 space-y-4">
          {/* Seller card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <Link href={`/utilizator/${ad.user.id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-[#1B3A2B] rounded-full flex items-center justify-center">
                  {ad.user.avatarUrl ? (
                    <img src={ad.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-gold" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#EDEDED] group-hover:text-gold transition">{ad.user.name || "Utilizator"}</p>
                  <div className="flex items-center gap-1 text-xs text-[#888]">
                    <Calendar className="h-3 w-3" />
                    Membru din {format(new Date(ad.user.createdAt), "MMMM yyyy", { locale: ro })}
                  </div>
                </div>
              </Link>

              <SellerRatingBadge sellerId={ad.userId} />
              <SellerBadges userId={ad.userId} compact />

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#888]">{ad.user._count.ads} anunturi active</span>
                {ad.user.isPhoneVerified && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Shield className="h-3 w-3 mr-0.5" /> Telefon verificat
                  </Badge>
                )}
                {ad.user.isIdVerified && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Shield className="h-3 w-3 mr-0.5" /> ID verificat
                  </Badge>
                )}
              </div>

              {!isOwner && (
                <div className="space-y-2">
                  <ContactButton adId={ad.id} sellerId={ad.userId} isLoggedIn={!!session} />
                  {ad.user.phone && (
                    <PhoneButton phone={ad.user.phone} />
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <FavoriteButton adId={ad.id} isFavorited={isFavorited} isLoggedIn={!!session} />
                <ShareButtons title={ad.title} url={`/anunturi/${ad.category.slug}/${ad.slug}`} />
                <ReportButton adId={ad.id} isLoggedIn={!!session} />
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-[#EDEDED] mb-3">Recenzii vanzator</h3>
              <ReviewSection
                sellerId={ad.userId}
                adId={ad.id}
                showForm={isBuyer && ad.status === "SOLD"}
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Similar ads */}
      {similarAds.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-[#EDEDED] mb-4">Anunturi similare</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {similarAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
